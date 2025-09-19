import { useConvex } from 'convex/react';

import { useConvexAuth } from 'convex/react';
import { createContext, useContext, useEffect, useRef } from 'react';

import { sessionIdStore } from '~/lib/stores/sessionId';

import { useConvexSessionIdOrNullOrLoading } from '~/lib/stores/sessionId';
import type { Id } from '@convex/_generated/dataModel';
import { useLocalStorage } from '@uidotdev/usehooks';
import { api } from '@convex/_generated/api';
import { toast } from 'sonner';
import { fetchOptIns } from '~/lib/convexOptins';
import { setChefDebugProperty } from 'chef-agent/utils/chefDebug';
import { useAuth } from '@workos-inc/authkit-react';
import { LoginRequiredError } from '@workos-inc/authkit-js';
type ChefAuthState =
  | {
      kind: 'loading';
    }
  | {
      kind: 'unauthenticated';
    }
  | {
      kind: 'fullyLoggedIn';
      sessionId: Id<'sessions'>;
    };

const ChefAuthContext = createContext<{
  state: ChefAuthState;
}>(null as unknown as { state: ChefAuthState });

export function useChefAuth() {
  const state = useContext(ChefAuthContext);
  if (state === null) {
    throw new Error('useChefAuth must be used within a ChefAuthProvider');
  }
  return state.state;
}

export function useChefAuthContext() {
  const state = useContext(ChefAuthContext);
  if (state === null) {
    throw new Error('useChefAuth must be used within a ChefAuthProvider');
  }
  return state;
}

export const SESSION_ID_KEY = 'sessionIdForConvex';

export const ChefAuthProvider = ({
  children,
  redirectIfUnauthenticated,
}: {
  children: React.ReactNode;
  redirectIfUnauthenticated: boolean;
}) => {
  const sessionId = useConvexSessionIdOrNullOrLoading();
  const convex = useConvex();
  const { isAuthenticated, isLoading: isConvexAuthLoading } = useConvexAuth();
  const [sessionIdFromLocalStorage, setSessionIdFromLocalStorage] = useLocalStorage<Id<'sessions'> | null>(
    SESSION_ID_KEY,
    null,
  );
  const hasAlertedAboutOptIns = useRef(false);
  const authRetries = useRef(0);
  const { getAccessToken } = useAuth();
  const workOsConfigWarningLogged = useRef(false);
  const workOsAccessTokenWarningLogged = useRef(false);
  const isWorkOsConfigured = Boolean(
    import.meta.env.VITE_WORKOS_CLIENT_ID &&
      (import.meta.env.VITE_WORKOS_API_HOSTNAME || import.meta.env.VITE_WORKOS_REDIRECT_URI),
  );

  useEffect(() => {
    function setSessionId(sessionId: Id<'sessions'> | null) {
      setSessionIdFromLocalStorage(sessionId);
      sessionIdStore.set(sessionId);
      if (sessionId) {
        setChefDebugProperty('sessionId', sessionId);
      }
    }

    const isUnauthenticated = !isAuthenticated && !isConvexAuthLoading;

    if (sessionId === undefined && isUnauthenticated) {
      setSessionId(null);
      return undefined;
    }

    if (sessionId !== null && isUnauthenticated) {
      setSessionId(null);
      return undefined;
    }
    let verifySessionTimeout: ReturnType<typeof setTimeout> | null = null;

    async function verifySession() {
      if (!isWorkOsConfigured) {
        if (!workOsConfigWarningLogged.current && import.meta.env.DEV) {
          console.info('Skipping WorkOS authentication: configuration is not available.');
          workOsConfigWarningLogged.current = true;
        }
        setSessionId(null);
        return;
      }

      if (sessionIdFromLocalStorage) {
        // Seems like auth might not automatically refresh its state, so call this to kick it
        try {
          // Call this to prove that WorkOS is set up
          await getAccessToken({});
          authRetries.current = 0;
        } catch (error) {
          const isLoginRequiredError =
            error instanceof LoginRequiredError ||
            (error instanceof Error &&
              (error.name === 'LoginRequiredError' || error.message === 'No access token available'));
          if (!isLoginRequiredError) {
            if (!workOsAccessTokenWarningLogged.current) {
              console.error('Unable to fetch access token from WorkOS', error);
              workOsAccessTokenWarningLogged.current = true;
            }
          }
          if (authRetries.current < 3 && verifySessionTimeout === null) {
            authRetries.current++;
            verifySessionTimeout = setTimeout(() => {
              void verifySession();
            }, 1000);
          }
          return;
        }
        if (!isAuthenticated) {
          // Wait until auth is propagated to Convex before we try to verify the session
          return;
        }
        let isValid: boolean = false;
        try {
          isValid = await convex.query(api.sessions.verifySession, {
            sessionId: sessionIdFromLocalStorage as Id<'sessions'>,
          });
        } catch (error) {
          console.error('Error verifying session', error);
          toast.error('Unexpected error verifying credentials');
          setSessionId(null);
        }
        if (isValid) {
          const optIns = await fetchOptIns(convex);
          if (optIns.kind === 'loaded' && optIns.optIns.length === 0) {
            setSessionId(sessionIdFromLocalStorage as Id<'sessions'>);
          }
          if (!hasAlertedAboutOptIns.current && optIns.kind === 'loaded' && optIns.optIns.length > 0) {
            toast.info('Please accept the Convex Terms of Service to continue');
            hasAlertedAboutOptIns.current = true;
          }
          if (hasAlertedAboutOptIns.current && optIns.kind === 'error') {
            toast.error('Unexpected error setting up your account.');
          }
        } else {
          // Clear it, the next loop around we'll try creating a new session
          // if we're authenticated.
          setSessionId(null);
        }
      }

      if (isAuthenticated) {
        try {
          const sessionId = await convex.mutation(api.sessions.startSession);
          setSessionId(sessionId);
        } catch (error) {
          console.error('Error creating session', error);
          setSessionId(null);
        }
      }
      return;
    }

    void verifySession();
    return () => {
      if (verifySessionTimeout) {
        clearTimeout(verifySessionTimeout);
      }
    };
  }, [
    convex,
    sessionId,
    isAuthenticated,
    isConvexAuthLoading,
    sessionIdFromLocalStorage,
    setSessionIdFromLocalStorage,
    getAccessToken,
    isWorkOsConfigured,
  ]);

  const isLoading = sessionId === undefined || isConvexAuthLoading;
  const isUnauthenticated = sessionId === null || !isAuthenticated;
  const state: ChefAuthState = isLoading
    ? { kind: 'loading' }
    : isUnauthenticated
      ? { kind: 'unauthenticated' }
      : { kind: 'fullyLoggedIn', sessionId: sessionId as Id<'sessions'> };

  if (redirectIfUnauthenticated && state.kind === 'unauthenticated') {
    console.log('redirecting to /');
    // Hard navigate to avoid any potential state leakage
    window.location.href = '/';
  }

  return <ChefAuthContext.Provider value={{ state }}>{children}</ChefAuthContext.Provider>;
};

import { useStore } from '@nanostores/react';
import { useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { useLocation } from '@remix-run/react';
import { chatStore } from '~/lib/stores/chatId';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/components/header/ChatDescription.client';
import { DeployButton } from './DeployButton';
import { ShareButton } from './ShareButton';
import { useConvexSessionIdOrNullOrLoading } from '~/lib/stores/sessionId';
import { HamburgerMenuIcon, PersonIcon, GearIcon, ExitIcon } from '@radix-ui/react-icons';
import { DownloadButton } from './DownloadButton';
import { LoggedOutHeaderButtons } from './LoggedOutHeaderButtons';
import { profileStore, setProfile } from '~/lib/stores/profile';
import { Menu as MenuComponent, MenuItem as MenuItemComponent } from '@ui/Menu';
import { SESSION_ID_KEY } from '~/components/chat/ChefAuthWrapper';
import { PromptDebugButton } from './PromptDebugButton';
import { ReferButton } from './ReferButton';
import { useSelectedTeamSlug } from '~/lib/stores/convexTeams';
import { useUsage } from '~/lib/stores/usage';
import { useReferralStats } from '~/lib/hooks/useReferralCode';
import { Menu } from '~/components/sidebar/Menu.client';
import { useAuth } from '@workos-inc/authkit-react';

export function Header({ hideSidebarIcon = false }: { hideSidebarIcon?: boolean }) {
  const chat = useStore(chatStore);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const sessionId = useConvexSessionIdOrNullOrLoading();
  const isLoggedIn = sessionId !== null;
  const showSidebarIcon = !hideSidebarIcon && isLoggedIn;

  const profile = useStore(profileStore);
  const { signOut } = useAuth();

  const teamSlug = useSelectedTeamSlug();
  const { isPaidPlan } = useUsage({ teamSlug });
  const referralStats = useReferralStats();

  const handleLogout = () => {
    setProfile(null);
    window.localStorage.removeItem(SESSION_ID_KEY);
    signOut({ returnTo: window.location.origin });
  };

  const handleSettingsClick = () => {
    window.location.pathname = '/settings';
  };

  const navItems = [
    { href: '/documents', label: 'Documents' },
    { href: '/templates', label: 'Templates' },
    { href: '/visualize', label: 'Visualize' },
    { href: '/reports', label: 'Reports' },
  ];

  return (
    <header
      className={
        'flex h-[var(--header-height)] items-center overflow-x-auto overflow-y-hidden border-b border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 p-5 text-bolt-elements-textPrimary'
      }
    >
      <div className="z-40 flex cursor-pointer items-center gap-4">
        {showSidebarIcon && (
          <HamburgerMenuIcon
            className="shrink-0"
            data-hamburger-menu
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
          />
        )}
        <a href="/">
          <img src="/chef.svg" alt="Chef logo" width={72} height={42} className="relative -top-1" />
        </a>

        {/* Navigation Links */}
        <nav className="ml-8 flex items-center space-x-6">
          {navItems.map(({ href, label }) => {
            const isActive = location.pathname === href || location.pathname.startsWith(`${href}/`);
            return (
              <a
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-bolt-elements-textPrimary'
                    : 'text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </a>
            );
          })}
        </nav>
      </div>
      <>
        {chat.started && (
          <span className="flex-1 truncate px-4 text-center text-bolt-elements-textPrimary">
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </span>
        )}
        <ClientOnly>
          {() => (
            <div className="ml-auto flex items-center gap-2">
              {!isLoggedIn && <LoggedOutHeaderButtons />}

              {chat.started && (
                <>
                  <PromptDebugButton />
                  {isPaidPlan === false && referralStats && referralStats.left > 0 && <ReferButton />}
                  <DownloadButton />
                  <ShareButton />
                  <DeployButton />
                  <div className="mr-1">
                    <HeaderActionButtons />
                  </div>
                </>
              )}
              {profile && (
                <MenuComponent
                  placement="top-start"
                  buttonProps={{
                    variant: 'neutral',
                    title: 'User menu',
                    inline: true,
                    className: 'rounded-full',
                    icon: profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt="User avatar"
                        className="size-8 min-w-8 rounded-full object-cover"
                        loading="eager"
                        decoding="sync"
                      />
                    ) : (
                      <PersonIcon className="size-8 min-w-8 rounded-full border text-bolt-elements-textSecondary" />
                    ),
                  }}
                >
                  <MenuItemComponent action={handleSettingsClick}>
                    <GearIcon className="text-bolt-elements-textSecondary" />
                    Settings & Usage
                  </MenuItemComponent>
                  <MenuItemComponent action={handleLogout}>
                    <ExitIcon className="text-bolt-elements-textSecondary" />
                    Log out
                  </MenuItemComponent>
                </MenuComponent>
              )}
            </div>
          )}
        </ClientOnly>
      </>
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </header>
  );
}

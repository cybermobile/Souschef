import { useFlags } from 'launchdarkly-react-client-sdk';
import { kebabCase } from 'lodash';

const flagDefaults: {
  maintenanceMode: boolean;
  showUsageAnnotations: boolean;
  recordRawPromptsForDebugging: boolean;
  maxCollapsedMessagesSize: number;
  maxRelevantFilesSize: number;
  minCollapsedMessagesSize: number;
  useGeminiAuto: boolean;
  notionClonePrompt: boolean;
  newChatFeature: boolean;
  minMessagesForNudge: number;
  enableResend: boolean;
  enableGpt5: boolean;
  useAnthropicFraction: number;
} = {
  maintenanceMode: false,
  showUsageAnnotations: false,
  recordRawPromptsForDebugging: false,
  maxCollapsedMessagesSize: 65536,
  maxRelevantFilesSize: 8192,
  minCollapsedMessagesSize: 8192,
  useGeminiAuto: false,
  notionClonePrompt: false,
  newChatFeature: false,
  minMessagesForNudge: 40,
  enableResend: false,
  enableGpt5: false,
  useAnthropicFraction: 1.0,
};

function kebabCaseKeys(object: typeof flagDefaults) {
  return Object.entries(object).reduce(
    (carry, [key, value]) => ({ ...carry, [kebabCase(key)]: value }),
    {} as { [key: string]: any },
  );
}

// Flag defaults need to be in the default kebab-case format:
// https://docs.launchdarkly.com/sdk/client-side/react/react-web#configuring-the-react-sdk
export const flagDefaultsKebabCase = kebabCaseKeys(flagDefaults);

const hasLaunchDarkly = Boolean(import.meta.env.VITE_LD_CLIENT_SIDE_ID);

// useLaunchDarkly is a thin wrapper on LaunchDarkly's react sdk which adds manual to flag keys.
// At some point, we can generate this file.
export function useLaunchDarkly() {
  if (!hasLaunchDarkly) {
    return flagDefaults;
  }

  // LaunchDarkly's React hook attempts to access context provided by withLDProvider. In local
  // development we skip mounting the provider entirely when no client ID is configured, so this
  // hook call is guarded behind the static build-time check above.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useFlags<typeof flagDefaults>();
}

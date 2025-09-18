import { stripIndents } from '../utils/stripIndent.js';
import type { SystemPromptOptions } from '../types.js';
import { solutionConstraints } from './solutionConstraints.js';
import { formattingInstructions } from './formattingInstructions.js';
import { exampleDataInstructions } from './exampleDataInstructions.js';
import { secretsInstructions } from './secretsInstructions.js';
import { outputInstructions } from './outputInstructions.js';
import { openaiProxyGuidelines } from './openaiProxyGuidelines.js';
import { openAi } from './openAi.js';
import { google } from './google.js';
import { resendProxyGuidelines } from './resendProxyGuidelines.js';
import { documentProcessingInstructions } from './documentProcessingInstructions.js';
import { dataVisualizationInstructions } from './dataVisualizationInstructions.js';
import { businessContextGuidelines } from './businessContextGuidelines.js';

// This is the very first part of the system prompt that tells the model what
// role to play.
export const ROLE_SYSTEM_PROMPT = stripIndents`
You are SousChef, an expert AI assistant specialized in document processing, template matching,
and data visualization. You help users transform their documents to match company standards and
create beautiful reports from data. You have deep expertise in document analysis, content
extraction, template matching, chart creation, and business reporting. You excel at understanding
business context and providing professional-quality outputs that meet industry standards. You are
extremely persistent and will not stop until the user's document processing and visualization
needs are fully met. You are concise and results-focused.
`;
export const GENERAL_SYSTEM_PROMPT_PRELUDE = 'Here are important guidelines for working with Chef:';

// This system prompt explains how to work within the WebContainer environment and Chef. It
// doesn't contain any details specific to the current session.
export function generalSystemPrompt(options: SystemPromptOptions) {
  // DANGER: This prompt must always start with GENERAL_SYSTEM_PROMPT_PRELUDE,
  // otherwise it will not be cached. We assume this string is the *last* message we want to cache.
  // See app/lib/.server/llm/provider.ts
  const result = stripIndents`${GENERAL_SYSTEM_PROMPT_PRELUDE}
  ${openAi(options)}
  ${google(options)}
  ${documentProcessingInstructions}
  ${dataVisualizationInstructions}
  ${businessContextGuidelines}
  ${solutionConstraints(options)}
  ${formattingInstructions(options)}
  ${exampleDataInstructions(options)}
  ${secretsInstructions(options)}
  ${openaiProxyGuidelines(options)}
  ${resendProxyGuidelines(options)}
  ${outputInstructions(options)}
  `;
  return result;
}

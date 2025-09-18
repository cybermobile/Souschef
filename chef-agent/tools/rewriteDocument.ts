import type { Tool } from 'ai';
import { z } from 'zod';

const rewriteDocumentDescription = `
Rewrite a document by applying a selected template while preserving the original content and meaning.
This tool intelligently:
- Maps content from the original document to template sections
- Preserves key information, data, and context
- Applies the template's structure, formatting, and style
- Maintains document hierarchy and organization
- Handles different document types (reports, proposals, memos, etc.)
- Generates a new document that follows the template format

The rewritten document maintains the substance of the original while conforming to the selected template's structure and style guidelines.
`;

export const rewriteDocumentParameters = z.object({
  originalDocumentId: z.string().describe('The ID of the original document to rewrite'),
  templateId: z.string().describe('The ID of the template to apply'),
  preserveData: z.boolean().optional().describe('Whether to preserve tables, charts, and data visualizations (default: true)'),
  preserveFormatting: z.boolean().optional().describe('Whether to preserve special formatting like bold, italic, bullet points (default: true)'),
  customInstructions: z.string().optional().describe('Additional instructions for the rewrite process'),
  outputFormat: z.enum(['docx', 'pdf', 'html', 'markdown']).optional().describe('Desired output format (default: same as original)'),
  includeComments: z.boolean().optional().describe('Whether to include comments explaining changes made (default: false)')
});

export const rewriteDocumentTool: Tool = {
  description: rewriteDocumentDescription,
  parameters: rewriteDocumentParameters,
};
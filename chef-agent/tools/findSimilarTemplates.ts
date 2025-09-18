import type { Tool } from 'ai';
import { z } from 'zod';

const findSimilarTemplatesDescription = `
Find document templates that are similar to a given document using vector similarity search.
This tool uses OpenAI embeddings and Convex vector search to:
- Generate embeddings for the input document content
- Perform similarity search against the documentTemplates table
- Rank results by cosine similarity score
- Filter by company, document type, and minimum similarity threshold
- Provide reasoning for why templates match

Returns a ranked list of similar templates with similarity scores and match explanations.
`;

export const findSimilarTemplatesParameters = z.object({
  documentContent: z.string().describe('The text content of the document to find templates for'),
  companyId: z.string().describe('The company ID to filter templates'),
  documentType: z.string().optional().describe('Optional document type filter (e.g., "report", "proposal", "memo")'),
  minSimilarity: z.number().min(0).max(1).optional().describe('Minimum similarity score threshold (0-1, default: 0.7)'),
  maxResults: z.number().min(1).max(20).optional().describe('Maximum number of results to return (default: 5)'),
  includePublic: z.boolean().optional().describe('Whether to include public/shared templates (default: false)')
});

export const findSimilarTemplatesTool: Tool = {
  description: findSimilarTemplatesDescription,
  parameters: findSimilarTemplatesParameters,
};
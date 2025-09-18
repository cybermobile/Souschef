import type { Tool } from 'ai';
import { z } from 'zod';

const processDocumentDescription = `
Process uploaded documents by extracting text content, analyzing structure, and preparing them for template matching.
Supports PDF, Word documents (.docx), and plain text files. This tool handles:
- PDF text extraction using pdf-parse
- Word document parsing using mammoth
- Document structure analysis (headings, sections, formatting)
- Content normalization for template matching
- Metadata extraction (file type, size, page count, etc.)

The processed document data is stored in the uploadedDocuments table with extracted content and analysis results.
`;

export const processDocumentParameters = z.object({
  fileId: z.string().describe('The ID of the uploaded file to process'),
  fileName: z.string().describe('The name of the uploaded file'),
  fileType: z.string().describe('The MIME type of the file (e.g., application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document)'),
  companyId: z.string().describe('The company ID for organizing documents'),
  extractStructure: z.boolean().optional().describe('Whether to perform detailed structure analysis (default: true)'),
  generateEmbedding: z.boolean().optional().describe('Whether to generate vector embeddings for similarity search (default: true)')
});

export const processDocumentTool: Tool = {
  description: processDocumentDescription,
  parameters: processDocumentParameters,
};
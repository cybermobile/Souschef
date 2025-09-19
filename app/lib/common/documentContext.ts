export interface DocumentStructureHeading {
  level?: number;
  text?: string;
  line?: number;
}

export interface DocumentStructureSummary {
  headings?: DocumentStructureHeading[];
  sections?: Array<{ title?: string; startLine?: number; endLine?: number }>;
  paragraphs?: number;
  wordCount?: number;
  hasLists?: boolean;
  hasTables?: boolean;
}

export interface DocumentContextSummary {
  id: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  uploadedAt: number;
  status: string;
  documentType?: string | null;
  wordCount?: number | null;
  pageCount?: number | null;
  snippet: string;
  isTruncated: boolean;
  headings?: string[];
  structureNotes?: string[];
}

export const MAX_DOCUMENT_SNIPPET_CHARS = 6000;
const MAX_HEADINGS = 8;

export function trimDocumentText(
  text: string,
  maxLength: number = MAX_DOCUMENT_SNIPPET_CHARS,
): { snippet: string; isTruncated: boolean } {
  if (text.length <= maxLength) {
    return { snippet: text.trim(), isTruncated: false };
  }

  return {
    snippet: `${text.slice(0, maxLength).trim()}…`,
    isTruncated: true,
  };
}

export function parseDocumentStructure(structure: unknown): DocumentStructureSummary | undefined {
  if (!structure) {
    return undefined;
  }

  try {
    if (typeof structure === 'string') {
      const parsed = JSON.parse(structure);
      if (parsed && typeof parsed === 'object') {
        return parsed as DocumentStructureSummary;
      }
      return undefined;
    }

    if (typeof structure === 'object') {
      return structure as DocumentStructureSummary;
    }
  } catch (error) {
    console.warn('Failed to parse document structure', error);
  }

  return undefined;
}

export function extractHeadingTexts(structure?: DocumentStructureSummary | null): string[] | undefined {
  if (!structure?.headings || structure.headings.length === 0) {
    return undefined;
  }

  const headings = structure.headings
    .map((heading) => heading?.text?.trim())
    .filter((text): text is string => Boolean(text && text.length > 0));

  if (!headings.length) {
    return undefined;
  }

  return headings.slice(0, MAX_HEADINGS);
}

export function summarizeStructureNotes(structure?: DocumentStructureSummary | null): string[] | undefined {
  if (!structure) {
    return undefined;
  }

  const notes: string[] = [];

  if (typeof structure.paragraphs === 'number') {
    notes.push(`${structure.paragraphs} paragraphs detected`);
  }

  if (structure.hasLists) {
    notes.push('Contains lists');
  }

  if (structure.hasTables) {
    notes.push('Contains tables');
  }

  if (typeof structure.wordCount === 'number') {
    notes.push(`${structure.wordCount} words (structure estimate)`);
  }

  if (structure.sections && structure.sections.length > 0) {
    notes.push(`${structure.sections.length} sections identified`);
  }

  return notes.length > 0 ? notes : undefined;
}

export function formatDocumentContextForPrompt(documents: DocumentContextSummary[]): string {
  if (documents.length === 0) {
    return '';
  }

  const header =
    'The user has uploaded the following documents for this chat session. Use their content and structure when responding.';

  const sections = documents.map((doc, index) => {
    const metadataParts: string[] = [];

    if (doc.documentType) {
      metadataParts.push(`Type: ${doc.documentType}`);
    }

    const sizeParts: string[] = [];
    if (doc.wordCount) {
      sizeParts.push(`${doc.wordCount} words`);
    }
    if (doc.pageCount) {
      sizeParts.push(`${doc.pageCount} pages`);
    }
    if (doc.fileSize) {
      sizeParts.push(`${Math.round(doc.fileSize / 1024)} KB`);
    }
    if (sizeParts.length > 0) {
      metadataParts.push(sizeParts.join(' • '));
    }

    const uploadedAt = Number.isFinite(doc.uploadedAt) ? new Date(doc.uploadedAt).toISOString() : undefined;
    if (uploadedAt) {
      metadataParts.push(`Uploaded at ${uploadedAt}`);
    }

    if (doc.structureNotes && doc.structureNotes.length > 0) {
      metadataParts.push(`Structure: ${doc.structureNotes.join(' • ')}`);
    }

    if (doc.headings && doc.headings.length > 0) {
      metadataParts.push(`Key headings: ${doc.headings.join(' | ')}`);
    }

    const lines: string[] = [
      `Document ${index + 1}: ${doc.fileName} (${doc.fileType})`,
      metadataParts.length > 0 ? metadataParts.join('\n') : undefined,
      doc.isTruncated ? 'Content excerpt (truncated):' : 'Content excerpt:',
      doc.snippet,
    ].filter((line): line is string => Boolean(line && line.length > 0));

    return lines.join('\n');
  });

  return [header, ...sections].join('\n\n---\n\n');
}

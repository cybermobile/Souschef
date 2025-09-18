"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

export const processUploadedDocument: any = action({
  args: {
    fileId: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    fileUrl: v.string(),
    companyId: v.string(),
    extractStructure: v.optional(v.boolean()),
    generateEmbedding: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; documentId?: string; extractedText?: string; structure?: any; metadata?: any; error?: string }> => {
    try {
      // Download file from storage
      const response = await fetch(args.fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      let extractedText = "";
      let metadata: any = {};

      // Extract text based on file type
      if (args.fileType === "application/pdf") {
        // PDF processing with pdf-parse
        const pdfParse = await import("pdf-parse");
        const pdfData = await pdfParse.default(Buffer.from(buffer));
        extractedText = pdfData.text;
        metadata = {
          pageCount: pdfData.numpages,
          info: pdfData.info,
          version: pdfData.version,
        };
      } else if (args.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        // Word document processing with mammoth
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
        extractedText = result.value;
        metadata = {
          messages: result.messages,
        };
      } else if (args.fileType.startsWith("text/")) {
        // Plain text files
        extractedText = new TextDecoder().decode(buffer);
        metadata = {
          encoding: "utf-8",
        };
      } else {
        throw new Error(`Unsupported file type: ${args.fileType}`);
      }

      // Structure analysis if requested
      let structure = null;
      if (args.extractStructure !== false) {
        structure = analyzeDocumentStructure(extractedText);
      }

      // Generate embedding if requested
      let embedding: number[] = [];
      if (args.generateEmbedding !== false) {
        const embeddingResult = await ctx.runAction(api.actions.embeddings.generateEmbedding, {
          text: extractedText.substring(0, 8000), // Limit for embedding API
        });
        if (embeddingResult.success && embeddingResult.embedding) {
          embedding = embeddingResult.embedding;
        }
      }

      // Store processed document
      const documentId: string = await ctx.runMutation(api.mutations.uploadedDocuments.create, {
        companyId: args.companyId,
        userId: "temp_user_id" as any, // Will need proper user ID from auth context
        fileName: args.fileName,
        fileType: args.fileType,
        fileSize: buffer.byteLength,
        fileUrl: args.fileUrl,
        originalContent: extractedText,
        extractedText,
        documentStructure: JSON.stringify(structure),
        embedding: embedding,
        processingStatus: "completed",
        processingProgress: 100,
        processingStartTime: Date.now(),
        processingEndTime: Date.now(),
        uploadedAt: Date.now(),
        processedAt: Date.now(),
      });

      return {
        success: true,
        documentId,
        extractedText,
        structure,
        metadata,
      };

    } catch (error) {
      console.error("Document processing error:", error);

      // Note: Cannot update status here without documentId - would need to be handled differently

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

function analyzeDocumentStructure(text: string) {
  const lines = text.split('\n');
  const structure = {
    headings: [] as Array<{ level: number; text: string; line: number }>,
    sections: [] as Array<{ title: string; startLine: number; endLine: number; content: string }>,
    paragraphs: 0,
    wordCount: 0,
    hasLists: false,
    hasTables: false,
  };

  let currentSection: any = null;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Detect headings (simple heuristic)
    if (trimmed.length > 0) {
      const isHeading =
        // All caps and short
        (trimmed === trimmed.toUpperCase() && trimmed.length < 50) ||
        // Starts with numbers
        /^\d+\.\s/.test(trimmed) ||
        // Common heading patterns
        /^(chapter|section|part|appendix)\s+\d+/i.test(trimmed);

      if (isHeading) {
        structure.headings.push({
          level: 1, // Simple level detection could be enhanced
          text: trimmed,
          line: index + 1,
        });

        // End previous section
        if (currentSection) {
          currentSection.endLine = index;
          structure.sections.push(currentSection);
        }

        // Start new section
        currentSection = {
          title: trimmed,
          startLine: index + 1,
          endLine: lines.length,
          content: "",
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }

      // Count paragraphs (non-empty lines)
      if (trimmed.length > 0) {
        structure.paragraphs++;
      }

      // Detect lists
      if (/^[\s]*[-*•]\s/.test(line) || /^[\s]*\d+\.\s/.test(line)) {
        structure.hasLists = true;
      }

      // Detect tables (simple heuristic)
      if (line.includes('|') && line.split('|').length > 2) {
        structure.hasTables = true;
      }
    }
  });

  // Add final section
  if (currentSection) {
    structure.sections.push(currentSection);
  }

  // Count words
  structure.wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

  return structure;
}
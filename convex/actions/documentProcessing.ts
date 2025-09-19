"use node";

import { Buffer } from "node:buffer";
import { action } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

export const processUploadedDocument = action({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.optional(v.number()),
    companyId: v.optional(v.string()),
    sessionId: v.optional(v.id("sessions")),
    extractStructure: v.optional(v.boolean()),
    generateEmbedding: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ success: boolean; documentId?: Id<"uploadedDocuments">; extractedText?: string; structure?: any; metadata?: any; error?: string }> => {
    try {
      const processingStart = Date.now();
      const member = await ctx.runQuery(internal.sessions.getCurrentMemberForActions, {});
      const storedFile = await ctx.storage.get(args.storageId);
      if (!storedFile) {
        throw new Error("Unable to read uploaded document from storage");
      }

      const arrayBuffer =
        storedFile instanceof Blob ? await storedFile.arrayBuffer() : storedFile;
      const buffer = Buffer.from(arrayBuffer);
      const fileUrl = await ctx.storage.getUrl(args.storageId);
      if (!fileUrl) {
        throw new Error("Unable to generate storage URL for uploaded document");
      }
      let extractedText = "";
      let metadata: any = {};

      // Extract text based on file type
      if (args.fileType === "application/pdf") {
        // PDF processing with pdf-parse
        const pdfParse = await import("pdf-parse");
        const pdfData = await pdfParse.default(buffer);
        extractedText = pdfData.text;
        metadata = {
          pageCount: pdfData.numpages,
          info: pdfData.info,
          version: pdfData.version,
        };
      } else if (args.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        // Word document processing with mammoth
        const mammothModule = await import("mammoth");
        const extractRawText =
          mammothModule.extractRawText ?? mammothModule.default?.extractRawText;

        if (typeof extractRawText !== "function") {
          throw new Error("Failed to load Word document parser");
        }

        const result = await extractRawText({ buffer });
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
      const completedAt = Date.now();
      const documentId = await ctx.runMutation(api.mutations.uploadedDocuments.create, {
        companyId: args.companyId ?? member.cachedProfile?.id ?? member._id,
        userId: member._id,
        sessionId: args.sessionId,
        fileName: args.fileName,
        fileType: args.fileType,
        fileSize: args.fileSize ?? buffer.byteLength,
        fileUrl,
        originalContent: extractedText,
        extractedText,
        documentStructure: structure ? JSON.stringify(structure) : undefined,
        documentType: metadata?.info?.Title ?? undefined,
        wordCount: structure?.wordCount,
        pageCount: metadata?.numpages ?? metadata?.info?.Pages ?? undefined,
        embedding: embedding,
        processingStatus: "completed",
        processingProgress: 100,
        processingStartTime: processingStart,
        processingEndTime: completedAt,
        uploadedAt: processingStart,
        processedAt: completedAt,
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
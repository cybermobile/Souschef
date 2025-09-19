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
      console.log("Attempting to get file from storage:", {
        storageId: args.storageId,
        storageIdType: typeof args.storageId
      });

      const storedFile = await ctx.storage.get(args.storageId);

      console.log("Storage get result:", {
        storedFileExists: !!storedFile,
        storedFileType: typeof storedFile,
        isBlob: typeof Blob !== "undefined" && storedFile instanceof Blob,
        blobSize: typeof Blob !== "undefined" && storedFile instanceof Blob ? storedFile.size : 'N/A',
        constructor: storedFile?.constructor?.name
      });

      if (!storedFile) {
        throw new Error(`Unable to read uploaded document from storage. Storage ID: ${args.storageId}`);
      }

      const buffer = await loadStorageFileAsBuffer(storedFile);

      console.log("File processing debug:", {
        fileName: args.fileName,
        fileType: args.fileType,
        fileSize: args.fileSize,
        bufferLength: buffer.byteLength,
        storageFileType: typeof storedFile
      });

      if (!buffer.byteLength) {
        throw new Error(`The uploaded document appears to be empty (${buffer.byteLength} bytes). Please upload a file with content. File info: ${args.fileName} (${args.fileType})`);
      }
      const fileUrl = await ctx.storage.getUrl(args.storageId);
      if (!fileUrl) {
        throw new Error("Unable to generate storage URL for uploaded document");
      }
      let extractedText = "";
      let metadata: any = {};

      // Extract text based on file type
      if (args.fileType === "application/pdf") {
        // PDF processing with pdf-parse
        try {
          const pdfParseModule = await import("pdf-parse");
          const pdfParse = pdfParseModule.default ?? pdfParseModule;

          console.log("About to parse PDF with buffer length:", buffer.byteLength);
          console.log("Buffer is valid:", Buffer.isBuffer(buffer));
          console.log("Buffer first 10 bytes:", Array.from(buffer.slice(0, 10)));

          // Try to parse with explicit options to avoid test file references
          const pdfData = await pdfParse(buffer, {
            // Disable any test mode or file path references
            max: 0, // Parse all pages
            version: 'default'
          });
          extractedText = pdfData.text;
          metadata = {
            pageCount: pdfData.numpages,
            info: pdfData.info,
            version: pdfData.version,
          };

          console.log("PDF parsing successful, extracted text length:", extractedText.length);
        } catch (pdfError) {
          console.error("PDF parsing error:", pdfError);
          // Fallback: if PDF parsing fails, return a message instead of throwing
          extractedText = `[PDF parsing failed: ${pdfError instanceof Error ? pdfError.message : "Unknown error"}. Please try a different PDF file or convert to a text format.]`;
          metadata = {
            pageCount: 0,
            info: { Title: args.fileName },
            version: "unknown",
            processingError: pdfError instanceof Error ? pdfError.message : "Unknown error"
          };
          console.log("Using fallback text due to PDF parsing error");
        }
      } else if (
        args.fileType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        args.fileName.toLowerCase().endsWith(".docx")
      ) {
        if (!args.fileName.toLowerCase().endsWith(".docx")) {
          throw new Error(
            "Only .docx Word documents are supported. Please convert your file and try again.",
          );
        }

        // Word document processing with mammoth
        const mammothModule = await import("mammoth");
        const extractRawText =
          mammothModule.extractRawText ?? mammothModule.default?.extractRawText;

        if (typeof extractRawText !== "function") {
          throw new Error("Failed to load Word document parser");
        }

        try {
          const result = await extractRawText({ buffer });
          extractedText = result.value;
          metadata = {
            messages: result.messages,
          };
        } catch (docError) {
          throw new Error(
            docError instanceof Error && /corrupted zip/i.test(docError.message)
              ? "We couldn't read that Word document. Make sure it's a valid .docx file that isn't password protected or corrupted."
              : `Failed to process Word document${
                  docError instanceof Error && docError.message
                    ? `: ${docError.message}`
                    : ""
                }`,
          );
        }
      } else if (args.fileType.startsWith("text/")) {
        // Plain text files
        extractedText = new TextDecoder().decode(buffer);
        metadata = {
          encoding: "utf-8",
        };
      } else if (args.fileType === "application/msword" || args.fileName.toLowerCase().endsWith(".doc")) {
        throw new Error(
          "Legacy .doc files are not supported. Please save the document as .docx and upload it again.",
        );
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

async function loadStorageFileAsBuffer(file: unknown): Promise<Buffer> {
  console.log("Loading storage file as buffer:", {
    fileExists: !!file,
    fileType: typeof file,
    isBuffer: Buffer.isBuffer(file),
    isArrayBuffer: file instanceof ArrayBuffer,
    isArrayBufferView: ArrayBuffer.isView(file),
    isBlob: typeof Blob !== "undefined" && file instanceof Blob,
    constructor: file?.constructor?.name
  });

  if (!file) {
    throw new Error("Unable to load uploaded file - file is null or undefined");
  }

  if (Buffer.isBuffer(file)) {
    console.log("File is already a Buffer, length:", file.byteLength);
    return file;
  }

  if (file instanceof ArrayBuffer) {
    const buffer = Buffer.from(file);
    console.log("Converted ArrayBuffer to Buffer, length:", buffer.byteLength);
    return buffer;
  }

  if (ArrayBuffer.isView(file)) {
    const buffer = Buffer.from(file.buffer, file.byteOffset, file.byteLength);
    console.log("Converted ArrayBufferView to Buffer, length:", buffer.byteLength);
    return buffer;
  }

  if (typeof Blob !== "undefined" && file instanceof Blob) {
    console.log("Converting Blob to Buffer, blob size:", file.size);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("Converted Blob to Buffer, length:", buffer.byteLength);
    return buffer;
  }

  throw new Error(`Unsupported uploaded file data type: ${typeof file} (${file?.constructor?.name})`);
}

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
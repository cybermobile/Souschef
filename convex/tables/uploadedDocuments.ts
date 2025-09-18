import { defineTable } from "convex/server";
import { v } from "convex/values";

// Uploaded documents table for storing and processing user-uploaded documents
export const uploadedDocuments = defineTable({
  // Organization and user
  companyId: v.string(),
  userId: v.id("convexMembers"),
  sessionId: v.optional(v.id("sessions")), // Link to chat session if applicable

  // File information
  fileName: v.string(),
  fileType: v.string(), // pdf, docx, doc, txt, rtf, etc.
  fileSize: v.number(), // in bytes
  fileUrl: v.string(), // Convex file storage URL

  // Content extraction
  originalContent: v.string(), // Raw extracted content with formatting
  extractedText: v.string(), // Clean text for processing and embedding
  documentStructure: v.optional(v.string()), // JSON of document structure (headings, lists, tables, etc.)

  // Document analysis
  documentType: v.optional(v.string()), // auto-detected type: proposal, report, memo, etc.
  language: v.optional(v.string()), // detected language
  wordCount: v.optional(v.number()),
  pageCount: v.optional(v.number()),

  // Vector embedding for similarity search
  embedding: v.array(v.float64()),

  // Processing status
  processingStatus: v.string(), // uploaded, extracting, analyzing, embedding, matching, rewriting, completed, failed
  processingProgress: v.number(), // 0-100
  processingStartTime: v.optional(v.number()),
  processingEndTime: v.optional(v.number()),
  errorMessage: v.optional(v.string()),
  errorDetails: v.optional(v.string()), // detailed error for debugging

  // Template matching results
  suggestedTemplates: v.optional(v.array(v.object({
    templateId: v.id("documentTemplates"),
    similarityScore: v.number(), // 0-1 similarity score
    matchReason: v.string(), // explanation of why this template matches
    structureAlignment: v.number(), // how well the structure aligns
    contentAlignment: v.number(), // how well the content aligns
  }))),
  selectedTemplateId: v.optional(v.id("documentTemplates")),

  // Rewriting results
  rewrittenContent: v.optional(v.string()), // document rewritten using template
  rewritingInstructions: v.optional(v.string()), // specific instructions for rewriting
  rewritingStatus: v.optional(v.string()), // pending, in_progress, completed, failed
  preservedContent: v.optional(v.array(v.object({ // content that must be preserved exactly
    originalText: v.string(),
    preservationReason: v.string(),
  }))),

  // Metadata
  uploadedAt: v.number(),
  processedAt: v.optional(v.number()),
  lastModified: v.optional(v.number()),

  // User feedback
  userRating: v.optional(v.number()), // 1-5 rating
  userFeedback: v.optional(v.string()),
  templateMatchAccuracy: v.optional(v.boolean()), // was the template match good?
})
.index("byCompanyAndUser", ["companyId", "userId"])
.index("bySession", ["sessionId"])
.index("byProcessingStatus", ["processingStatus", "companyId"])
.index("byUploadDate", ["uploadedAt"])
.vectorIndex("by_content_embedding", {
  vectorField: "embedding",
  dimensions: 1536,
  filterFields: ["companyId", "userId", "processingStatus", "documentType"],
});
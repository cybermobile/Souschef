import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    companyId: v.string(),
    userId: v.id("convexMembers"),
    sessionId: v.optional(v.id("sessions")),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    fileUrl: v.string(),
    originalContent: v.string(),
    extractedText: v.string(),
    documentStructure: v.optional(v.string()),
    documentType: v.optional(v.string()),
    language: v.optional(v.string()),
    wordCount: v.optional(v.number()),
    pageCount: v.optional(v.number()),
    embedding: v.array(v.float64()),
    processingStatus: v.string(),
    processingProgress: v.number(),
    processingStartTime: v.optional(v.number()),
    processingEndTime: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    uploadedAt: v.number(),
    processedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("uploadedDocuments", args);
  },
});

export const updateStatus = mutation({
  args: {
    documentId: v.id("uploadedDocuments"),
    status: v.string(),
    errorMessage: v.optional(v.string()),
    processingProgress: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.documentId, {
      processingStatus: args.status,
      errorMessage: args.errorMessage,
      processingProgress: args.processingProgress || 100,
      processingEndTime: Date.now(),
      processedAt: Date.now(),
    });
  },
});
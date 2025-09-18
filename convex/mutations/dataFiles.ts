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
    columnHeaders: v.array(v.string()),
    columnTypes: v.array(v.object({
      name: v.string(),
      type: v.string(),
      nullable: v.boolean(),
      uniqueCount: v.number(),
      sampleValues: v.array(v.string()),
    })),
    rowCount: v.number(),
    columnCount: v.number(),
    dataPreview: v.string(),
    dataStatistics: v.optional(v.any()),
    dataQuality: v.optional(v.any()),
    schemaDescription: v.string(),
    schemaEmbedding: v.array(v.float64()),
    suggestedCharts: v.optional(v.any()),
    detectedPatterns: v.optional(v.any()),
    processingStatus: v.string(),
    processingProgress: v.number(),
    errorMessage: v.optional(v.string()),
    uploadedAt: v.number(),
    processedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("dataFiles", args);
  },
});

export const updateStatus = mutation({
  args: {
    dataFileId: v.id("dataFiles"),
    status: v.string(),
    errorMessage: v.optional(v.string()),
    processingProgress: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.dataFileId, {
      processingStatus: args.status,
      errorMessage: args.errorMessage,
      processingProgress: args.processingProgress || 100,
      processedAt: Date.now(),
    });
  },
});
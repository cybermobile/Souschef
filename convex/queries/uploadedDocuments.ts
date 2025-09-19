import { query } from "../_generated/server";
import { v, ConvexError } from "convex/values";

import { getCurrentMember } from "../sessions";

export const getProcessingStatus = query({
  args: {
    documentId: v.id("uploadedDocuments"),
  },
  handler: async (ctx, args) => {
    const member = await getCurrentMember(ctx);
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      return null;
    }
    if (document.userId !== member._id) {
      throw new ConvexError({ code: "NotAuthorized", message: "Document not accessible" });
    }

    return {
      status: document.processingStatus,
      progress: document.processingProgress,
      currentStep: document.processingStatus,
      error: document.errorMessage ?? null,
      startTime: document.processingStartTime ?? document.uploadedAt,
      endTime: document.processingEndTime ?? document.processedAt ?? null,
    };
  },
});

export const listForSession = query({
  args: {
    sessionId: v.optional(v.id("sessions")),
  },
  handler: async (ctx, args) => {
    const member = await getCurrentMember(ctx);
    const documents = await ctx.db
      .query("uploadedDocuments")
      .withIndex("byCompanyAndUser", (q) =>
        q.eq("companyId", member.cachedProfile?.id ?? member._id).eq("userId", member._id),
      )
      .order("desc")
      .take(50);

    return documents
      .filter((doc) => !args.sessionId || doc.sessionId === args.sessionId)
      .map((doc) => ({
        _id: doc._id,
        sessionId: doc.sessionId,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        uploadedAt: doc.uploadedAt,
        processingStatus: doc.processingStatus,
        processingProgress: doc.processingProgress,
        extractedText: doc.extractedText,
        documentType: doc.documentType,
        wordCount: doc.wordCount,
        pageCount: doc.pageCount,
        documentStructure: doc.documentStructure,
      }));
  },
});

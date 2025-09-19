import { query } from "../_generated/server";
import { v, ConvexError } from "convex/values";

import { getCurrentMember } from "../sessions";

export const getProcessingStatus = query({
  args: {
    dataFileId: v.id("dataFiles"),
  },
  handler: async (ctx, args) => {
    const member = await getCurrentMember(ctx);
    const dataFile = await ctx.db.get(args.dataFileId);
    if (!dataFile) {
      return null;
    }
    if (dataFile.userId !== member._id) {
      throw new ConvexError({ code: "NotAuthorized", message: "Data file not accessible" });
    }

    return {
      status: dataFile.processingStatus,
      progress: dataFile.processingProgress,
      currentStep: dataFile.processingStatus,
      error: dataFile.errorMessage ?? null,
      startTime: dataFile.uploadedAt,
      endTime: dataFile.processedAt ?? null,
    };
  },
});

export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    const member = await getCurrentMember(ctx);
    return await ctx.db
      .query("dataFiles")
      .withIndex("byCompanyAndUser", (q) =>
        q.eq("companyId", member.cachedProfile?.id ?? member._id).eq("userId", member._id),
      )
      .order("desc")
      .take(50);
  },
});

import { mutation } from "../_generated/server";

import { getCurrentMember } from "../sessions";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await getCurrentMember(ctx);
    const uploadUrl = await ctx.storage.generateUploadUrl();
    return { uploadUrl };
  },
});

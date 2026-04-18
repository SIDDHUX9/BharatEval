import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
  args: {
    questionId: v.id("questions"),
    translationId: v.optional(v.id("translations")),
    rating: v.number(),
    comment: v.optional(v.string()),
    flaggedIssue: v.optional(v.string()),
    suggestedImprovement: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    return await ctx.db.insert("teacherFeedback", {
      ...args,
      teacherEmail: identity?.email ?? "anonymous",
    });
  },
});

export const getForQuestion = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("teacherFeedback")
      .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
      .take(50);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("teacherFeedback").take(500);
    const avgRating = all.reduce((sum, f) => sum + f.rating, 0) / (all.length || 1);
    const flagged = all.filter((f) => f.flaggedIssue).length;
    return {
      total: all.length,
      avgRating: Math.round(avgRating * 10) / 10,
      flagged,
    };
  },
});

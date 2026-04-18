import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getForQuestion = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("translations")
      .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
      .collect();
  },
});

export const getByLanguage = query({
  args: { language: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("translations")
      .withIndex("by_language", (q) => q.eq("language", args.language))
      .take(args.limit ?? 50);
  },
});

export const create = mutation({
  args: {
    questionId: v.id("questions"),
    language: v.string(),
    translatedContent: v.string(),
    translatedOptions: v.optional(v.array(v.string())),
    translatedAnswer: v.optional(v.string()),
    translatedExplanation: v.optional(v.string()),
    bleuScore: v.optional(v.number()),
    semanticScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if translation already exists
    const existing = await ctx.db
      .query("translations")
      .withIndex("by_question_and_language", (q) =>
        q.eq("questionId", args.questionId).eq("language", args.language)
      )
      .unique();
    if (existing) {
      return await ctx.db.patch(existing._id, {
        translatedContent: args.translatedContent,
        translatedOptions: args.translatedOptions,
        translatedAnswer: args.translatedAnswer,
        translatedExplanation: args.translatedExplanation,
        bleuScore: args.bleuScore,
        semanticScore: args.semanticScore,
      });
    }
    return await ctx.db.insert("translations", { ...args, isValidated: false });
  },
});

export const createInternal = mutation({
  args: {
    questionId: v.id("questions"),
    language: v.string(),
    translatedContent: v.string(),
    translatedOptions: v.optional(v.array(v.string())),
    translatedAnswer: v.optional(v.string()),
    translatedExplanation: v.optional(v.string()),
    bleuScore: v.optional(v.number()),
    semanticScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("translations")
      .withIndex("by_question_and_language", (q) =>
        q.eq("questionId", args.questionId).eq("language", args.language)
      )
      .unique();
    if (existing) {
      return await ctx.db.patch(existing._id, {
        translatedContent: args.translatedContent,
        translatedOptions: args.translatedOptions,
        translatedAnswer: args.translatedAnswer,
        translatedExplanation: args.translatedExplanation,
        bleuScore: args.bleuScore,
        semanticScore: args.semanticScore,
      });
    }
    return await ctx.db.insert("translations", { ...args, isValidated: false });
  },
});

export const getForQuestionAndLanguage = query({
  args: { questionId: v.id("questions"), language: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("translations")
      .withIndex("by_question_and_language", (q) =>
        q.eq("questionId", args.questionId).eq("language", args.language)
      )
      .unique();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("translations").take(1000);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("translations").take(1000);
    const languages = new Set(all.map((t) => t.language));
    const validated = all.filter((t) => t.isValidated).length;
    const avgBleu = all.filter((t) => t.bleuScore).reduce((sum, t) => sum + (t.bleuScore ?? 0), 0) / (all.filter((t) => t.bleuScore).length || 1);
    return {
      total: all.length,
      validated,
      languages: languages.size,
      avgBleuScore: Math.round(avgBleu * 100) / 100,
      byLanguage: Array.from(languages).map((l) => ({
        language: l,
        count: all.filter((t) => t.language === l).length,
      })),
    };
  },
});

export const seedSampleTranslations = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("translations").take(1);
    if (existing.length > 0) return { seeded: false };

    const questions = await ctx.db.query("questions").take(3);
    if (questions.length === 0) return { seeded: false, reason: "No questions found" };

    const sampleTranslations = [
      {
        questionId: questions[0]._id,
        language: "hi",
        translatedContent: "एक त्रिभुज का क्षेत्रफल ज्ञात करें जिसका आधार 12 सेमी और ऊंचाई 8 सेमी है।",
        translatedAnswer: "48 वर्ग सेमी",
        bleuScore: 0.82,
        semanticScore: 0.91,
        isValidated: true,
      },
      {
        questionId: questions[0]._id,
        language: "ta",
        translatedContent: "12 செமீ அடிப்பகுதி மற்றும் 8 செமீ உயரம் கொண்ட முக்கோணத்தின் பரப்பளவைக் காண்க.",
        translatedAnswer: "48 சதுர செமீ",
        bleuScore: 0.78,
        semanticScore: 0.88,
        isValidated: true,
      },
      {
        questionId: questions[1]._id,
        language: "hi",
        translatedContent: "निम्नलिखित में से कौन सा x² - 5x + 6 = 0 का मूल है?",
        translatedOptions: ["1", "2", "4", "5"],
        translatedAnswer: "2",
        bleuScore: 0.85,
        semanticScore: 0.93,
        isValidated: true,
      },
    ];

    for (const t of sampleTranslations) {
      await ctx.db.insert("translations", t);
    }
    return { seeded: true, count: sampleTranslations.length };
  },
});
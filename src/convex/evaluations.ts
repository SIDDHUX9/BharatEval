import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getModelStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("modelEvaluations").take(1000);
    const models = new Set(all.map((e) => e.modelName));
    return Array.from(models).map((model) => {
      const modelEvals = all.filter((e) => e.modelName === model);
      const correct = modelEvals.filter((e) => e.isCorrect).length;
      const languages = new Set(modelEvals.map((e) => e.language));
      const avgLatency = modelEvals.reduce((sum, e) => sum + (e.latencyMs ?? 0), 0) / (modelEvals.length || 1);
      return {
        model,
        total: modelEvals.length,
        correct,
        accuracy: modelEvals.length > 0 ? Math.round((correct / modelEvals.length) * 100) : 0,
        languages: Array.from(languages),
        avgLatencyMs: Math.round(avgLatency),
      };
    });
  },
});

export const getLanguageStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("modelEvaluations").take(1000);
    const languages = new Set(all.map((e) => e.language));
    return Array.from(languages).map((lang) => {
      const langEvals = all.filter((e) => e.language === lang);
      const correct = langEvals.filter((e) => e.isCorrect).length;
      return {
        language: lang,
        total: langEvals.length,
        accuracy: langEvals.length > 0 ? Math.round((correct / langEvals.length) * 100) : 0,
      };
    });
  },
});

export const createSession = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    models: v.array(v.string()),
    languages: v.array(v.string()),
    subjects: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    return await ctx.db.insert("evaluationSessions", {
      ...args,
      status: "pending",
      createdBy: identity?.email,
    });
  },
});

export const getSessions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("evaluationSessions").take(50);
  },
});

export const seedSampleEvaluations = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("modelEvaluations").take(1);
    if (existing.length > 0) return { seeded: false };

    const questions = await ctx.db.query("questions").take(5);
    if (questions.length === 0) return { seeded: false };

    const models = [
      { name: "GPT-4o", provider: "OpenAI" },
      { name: "Llama-3.1-70B", provider: "Meta" },
      { name: "Mistral-7B", provider: "Mistral AI" },
      { name: "Gemini-1.5-Pro", provider: "Google" },
    ];
    const languages = ["en", "hi", "ta"];

    for (const q of questions) {
      for (const model of models) {
        for (const lang of languages) {
          const isCorrect = Math.random() > 0.3;
          await ctx.db.insert("modelEvaluations", {
            modelName: model.name,
            modelProvider: model.provider,
            questionId: q._id,
            language: lang,
            response: isCorrect ? "Correct response" : "Incorrect response",
            isCorrect,
            score: isCorrect ? Math.random() * 0.3 + 0.7 : Math.random() * 0.4,
            latencyMs: Math.floor(Math.random() * 2000) + 500,
            tokensUsed: Math.floor(Math.random() * 500) + 100,
            evaluatedAt: Date.now(),
          });
        }
      }
    }
    return { seeded: true };
  },
});

export const createEvaluation = mutation({
  args: {
    modelName: v.string(),
    modelProvider: v.string(),
    questionId: v.id("questions"),
    language: v.string(),
    response: v.string(),
    isCorrect: v.optional(v.boolean()),
    score: v.optional(v.number()),
    latencyMs: v.optional(v.number()),
    tokensUsed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("modelEvaluations", {
      ...args,
      evaluatedAt: Date.now(),
    });
  },
});

export const updateSessionStatus = mutation({
  args: {
    sessionId: v.id("evaluationSessions"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.sessionId, {
      status: args.status,
      ...(args.status === "completed" ? { completedAt: Date.now() } : {}),
    });
  },
});

export const updateSessionProgress = mutation({
  args: {
    sessionId: v.id("evaluationSessions"),
    completedQuestions: v.number(),
    totalQuestions: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.sessionId, {
      completedQuestions: args.completedQuestions,
      totalQuestions: args.totalQuestions,
    });
  },
});

export const getBharatBenchScore = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("modelEvaluations").take(1000);
    if (all.length === 0) return null;

    // Accuracy: overall correct rate
    const correct = all.filter((e) => e.isCorrect).length;
    const accuracy = Math.round((correct / all.length) * 100);

    // Consistency: how consistent across languages (lower variance = higher consistency)
    const languages = [...new Set(all.map((e) => e.language))];
    if (languages.length > 1) {
      const langAccuracies = languages.map((lang) => {
        const langEvals = all.filter((e) => e.language === lang);
        const langCorrect = langEvals.filter((e) => e.isCorrect).length;
        return langEvals.length > 0 ? (langCorrect / langEvals.length) * 100 : 0;
      });
      const avgLangAcc = langAccuracies.reduce((a, b) => a + b, 0) / langAccuracies.length;
      const variance = langAccuracies.reduce((sum, acc) => sum + Math.pow(acc - avgLangAcc, 2), 0) / langAccuracies.length;
      const stdDev = Math.sqrt(variance);
      const consistency = Math.round(Math.max(0, 100 - stdDev * 2));

      // Bias index: inverse of cross-language performance gap
      const maxGap = Math.max(...langAccuracies) - Math.min(...langAccuracies);
      const biasIndex = Math.round(Math.max(0, 100 - maxGap));

      // Cultural fit: based on non-English language performance
      const nonEnglishEvals = all.filter((e) => e.language !== "en");
      const nonEnglishCorrect = nonEnglishEvals.filter((e) => e.isCorrect).length;
      const culturalFit = nonEnglishEvals.length > 0
        ? Math.round((nonEnglishCorrect / nonEnglishEvals.length) * 100)
        : accuracy;

      return { accuracy, consistency, biasIndex, culturalFit };
    }

    return { accuracy, consistency: 100, biasIndex: 100, culturalFit: accuracy };
  },
});
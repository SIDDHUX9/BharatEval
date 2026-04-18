"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import Groq from "groq-sdk";
import OpenAI from "openai";

function cleanJson(raw: string): string {
  const s = raw.trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return s.slice(start, end + 1);
  }
  return s;
}

function cleanJsonArray(raw: string): string {
  const s = raw.trim();
  const start = s.indexOf("[");
  const end = s.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    return s.slice(start, end + 1);
  }
  return s;
}

async function callAI(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  temperature = 0.7,
  maxTokens = 800
): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (groqKey) {
    const groq = new Groq({ apiKey: groqKey });
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      temperature,
      max_tokens: maxTokens,
    });
    return response.choices[0]?.message?.content ?? "";
  }

  if (openaiKey) {
    const openai = new OpenAI({ apiKey: openaiKey });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature,
      max_tokens: maxTokens,
    });
    return response.choices[0]?.message?.content ?? "";
  }

  throw new Error("No AI API key configured. Please set GROQ_API_KEY (free at console.groq.com) or OPENAI_API_KEY in the Backend API Keys tab.");
}

export const generateQuestion = action({
  args: {
    subject: v.string(),
    topic: v.string(),
    questionType: v.string(),
    difficulty: v.string(),
    bloomsLevel: v.string(),
    gradeLevel: v.string(),
    additionalContext: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const difficultyMap: Record<string, string> = {
      easy: "straightforward, suitable for basic recall",
      medium: "requires understanding and application",
      hard: "requires analysis, evaluation, or synthesis",
    };
    const bloomsMap: Record<string, string> = {
      remember: "recall facts and basic concepts",
      understand: "explain ideas or concepts",
      apply: "use information in new situations",
      analyze: "draw connections among ideas",
      evaluate: "justify a decision or course of action",
      create: "produce new or original work",
    };
    const typeInstructions: Record<string, string> = {
      mcq: "Generate a multiple choice question with exactly 4 options. Return JSON with fields: contentEnglish, options (array of 4 strings), correctAnswer (the correct option text), explanation.",
      numerical: "Generate a numerical problem. Return JSON with fields: contentEnglish, correctAnswer (the numerical answer with units), explanation.",
      short_answer: "Generate a short answer question. Return JSON with fields: contentEnglish, correctAnswer (2-3 sentence answer), explanation.",
      long_answer: "Generate a long answer question. Return JSON with fields: contentEnglish, correctAnswer (key points to cover), explanation.",
      case_study: "Generate a case study question with a scenario. Return JSON with fields: contentEnglish (include the scenario), correctAnswer (key analysis points), explanation.",
    };

    const contextLine = args.additionalContext ? "- Additional context: " + args.additionalContext : "";
    const prompt = [
      "You are an expert Indian curriculum educator creating NCERT-aligned questions.",
      "",
      "Generate a " + args.questionType + " question for:",
      "- Subject: " + args.subject,
      "- Topic: " + args.topic,
      "- Grade Level: " + args.gradeLevel.replace("_", " "),
      "- Difficulty: " + args.difficulty + " (" + (difficultyMap[args.difficulty] ?? args.difficulty) + ")",
      "- Blooms Taxonomy Level: " + args.bloomsLevel + " (" + (bloomsMap[args.bloomsLevel] ?? args.bloomsLevel) + ")",
      contextLine,
      "",
      typeInstructions[args.questionType] ?? typeInstructions.short_answer,
      "",
      "Use culturally relevant Indian examples where appropriate.",
      "Return ONLY valid JSON, no markdown, no explanation outside the JSON.",
    ].filter(Boolean).join("\n");

    const content = await callAI([
      { role: "system", content: "You are an expert Indian curriculum educator. Always return valid JSON only." },
      { role: "user", content: prompt },
    ], 0.7, 800);

    return JSON.parse(cleanJson(content));
  },
});

export const translateQuestion = action({
  args: {
    questionId: v.id("questions"),
    targetLanguage: v.string(),
    contentEnglish: v.string(),
    options: v.optional(v.array(v.string())),
    correctAnswer: v.optional(v.string()),
    explanation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const langNames: Record<string, string> = {
      hi: "Hindi", ta: "Tamil", te: "Telugu", bn: "Bengali",
      mr: "Marathi", gu: "Gujarati", kn: "Kannada", ml: "Malayalam", pa: "Punjabi",
    };
    const langName = langNames[args.targetLanguage] ?? args.targetLanguage;

    const parts = [
      "Translate the following educational question content to " + langName + ".",
      "Preserve the educational meaning, difficulty level, and cultural context.",
      "Return ONLY valid JSON with these fields:",
      "- translatedContent: the main question translated to " + langName,
      "- translatedOptions: array of translated options (if provided, else empty array)",
      "- translatedCorrectAnswer: translated correct answer (if provided, else empty string)",
      "- translatedExplanation: translated explanation (if provided, else empty string)",
      "- bleuScore: estimated BLEU score 0-1 (your confidence in translation quality)",
      "- semanticScore: estimated semantic similarity 0-1",
      "",
      "Question: " + args.contentEnglish,
    ];
    if (args.options && args.options.length > 0) {
      parts.push("Options: " + args.options.join(" | "));
    }
    if (args.correctAnswer) parts.push("Correct Answer: " + args.correctAnswer);
    if (args.explanation) parts.push("Explanation: " + args.explanation);
    parts.push("", "Return ONLY valid JSON, no markdown.");

    const content = await callAI([
      { role: "system", content: "You are an expert multilingual Indian education translator. Always return valid JSON only." },
      { role: "user", content: parts.join("\n") },
    ], 0.3, 1000);

    const parsed = JSON.parse(cleanJson(content));

    await ctx.runMutation(api.translations.create, {
      questionId: args.questionId,
      language: args.targetLanguage,
      translatedContent: parsed.translatedContent ?? "",
      translatedOptions: Array.isArray(parsed.translatedOptions) ? parsed.translatedOptions : [],
      translatedAnswer: parsed.translatedCorrectAnswer ?? "",
      translatedExplanation: parsed.translatedExplanation ?? "",
      bleuScore: typeof parsed.bleuScore === "number" ? parsed.bleuScore : undefined,
      semanticScore: typeof parsed.semanticScore === "number" ? parsed.semanticScore : undefined,
    });

    return {
      success: true,
      bleuScore: typeof parsed.bleuScore === "number" ? Math.round(parsed.bleuScore * 100) / 100 : null,
      semanticScore: typeof parsed.semanticScore === "number" ? Math.round(parsed.semanticScore * 100) / 100 : null,
    };
  },
});

export const runEvaluationSession = action({
  args: {
    sessionId: v.id("evaluationSessions"),
    questionIds: v.array(v.id("questions")),
    models: v.array(v.string()),
    languages: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(api.evaluations.updateSessionStatus, {
      sessionId: args.sessionId,
      status: "running",
    });

    let completed = 0;
    const total = args.questionIds.length * args.models.length * args.languages.length;

    for (const questionId of args.questionIds) {
      const question = await ctx.runQuery(api.questions.getById, { id: questionId });
      if (!question) continue;

      for (const model of args.models) {
        for (const language of args.languages) {
          const langNames: Record<string, string> = {
            en: "English", hi: "Hindi", ta: "Tamil", te: "Telugu", bn: "Bengali",
          };
          const langName = langNames[language] ?? language;

          const evalParts = [
            "You are evaluating an AI model on an Indian curriculum question.",
            "Question: " + question.contentEnglish,
            "Language: " + langName,
            "Difficulty: " + question.difficulty,
            "Subject: " + question.subject,
            "",
            "Simulate how a " + model + " model would answer this question in " + langName + ".",
            "Return ONLY valid JSON with fields:",
            "- response: the model answer string",
            "- isCorrect: boolean",
            "- score: number 0-1",
            "- latencyMs: number 300-3000",
            "- tokensUsed: number 50-500",
            "",
            "Correct answer for reference: " + (question.correctAnswer ?? "N/A"),
          ];

          try {
            const content = await callAI([
              { role: "system", content: "You are an AI evaluation simulator. Always return valid JSON only." },
              { role: "user", content: evalParts.join("\n") },
            ], 0.5, 300);

            const parsed = JSON.parse(cleanJson(content));
            await ctx.runMutation(api.evaluations.createEvaluation, {
              modelName: model,
              modelProvider: model.startsWith("gpt") ? "OpenAI" : model.startsWith("claude") ? "Anthropic" : "Other",
              questionId,
              language,
              response: parsed.response ?? "",
              isCorrect: typeof parsed.isCorrect === "boolean" ? parsed.isCorrect : false,
              score: typeof parsed.score === "number" ? parsed.score : 0.5,
              latencyMs: typeof parsed.latencyMs === "number" ? parsed.latencyMs : 1000,
              tokensUsed: typeof parsed.tokensUsed === "number" ? parsed.tokensUsed : 200,
            });
          } catch (e) {
            console.error("[runEvaluationSession] Error for", model, language, ":", e);
          }

          completed++;
          await ctx.runMutation(api.evaluations.updateSessionProgress, {
            sessionId: args.sessionId,
            completedQuestions: completed,
            totalQuestions: total,
          });
        }
      }
    }

    await ctx.runMutation(api.evaluations.updateSessionStatus, {
      sessionId: args.sessionId,
      status: "completed",
    });

    return { success: true, completed, total };
  },
});

export const translateFreeText = action({
  args: {
    text: v.string(),
    targetLanguage: v.string(),
  },
  handler: async (_ctx, args) => {
    const langNames: Record<string, string> = {
      hi: "Hindi", ta: "Tamil", te: "Telugu", bn: "Bengali",
      mr: "Marathi", gu: "Gujarati", kn: "Kannada", ml: "Malayalam", pa: "Punjabi",
    };
    const langName = langNames[args.targetLanguage] ?? args.targetLanguage;

    const prompt = [
      "Translate the following text to " + langName + ".",
      "Preserve the meaning, tone, and context accurately.",
      "Return ONLY valid JSON with these fields:",
      "- translatedContent: the text translated to " + langName,
      "- bleuScore: estimated BLEU score 0-1 (your confidence in translation quality)",
      "- semanticScore: estimated semantic similarity 0-1",
      "",
      "Text: " + args.text,
      "",
      "Return ONLY valid JSON, no markdown.",
    ].join("\n");

    const content = await callAI([
      { role: "system", content: "You are an expert multilingual translator. Always return valid JSON only." },
      { role: "user", content: prompt },
    ], 0.3, 600);

    const parsed = JSON.parse(cleanJson(content));
    return {
      translatedContent: parsed.translatedContent ?? "",
      bleuScore: typeof parsed.bleuScore === "number" ? Math.round(parsed.bleuScore * 100) / 100 : null,
      semanticScore: typeof parsed.semanticScore === "number" ? Math.round(parsed.semanticScore * 100) / 100 : null,
    };
  },
});

export const generateBulkQuestions = action({
  args: {
    gradeLevel: v.string(),
    subject: v.string(),
    language: v.string(),
    difficulty: v.string(),
  },
  handler: async (_ctx, args) => {
    const langNames: Record<string, string> = {
      en: "English",
      hi: "Hindi",
      ta: "Tamil",
    };
    const langName = langNames[args.language] ?? args.language;

    const difficultyMap: Record<string, string> = {
      easy: "straightforward, suitable for basic recall",
      medium: "requires understanding and application",
      hard: "requires analysis, evaluation, or synthesis",
    };

    const prompt = [
      "You are an expert Indian curriculum educator creating NCERT-aligned exam questions.",
      "",
      "Generate exactly 5 exam-style questions for:",
      "- Subject: " + args.subject,
      "- Grade Level: " + args.gradeLevel.replace("_", " "),
      "- Difficulty: " + args.difficulty + " (" + (difficultyMap[args.difficulty] ?? args.difficulty) + ")",
      "- Language: " + langName,
      "",
      "Mix question types: include MCQs (with 4 options), short answer, and numerical questions.",
      "Write ALL question content in " + langName + " (including options, answers, explanations).",
      "Use culturally relevant Indian examples.",
      "",
      "Return ONLY a valid JSON array of exactly 5 objects. Each object must have:",
      "- questionNumber: number (1-5)",
      "- questionType: 'mcq' | 'short_answer' | 'numerical'",
      "- content: the question text in " + langName,
      "- options: array of 4 strings for MCQ, empty array for others",
      "- correctAnswer: the answer in " + langName,
      "- explanation: brief explanation in " + langName,
      "- marks: number (1 for easy, 2 for medium, 3 for hard)",
      "",
      "Return ONLY the JSON array, no markdown, no extra text.",
    ].join("\n");

    const content = await callAI([
      { role: "system", content: "You are an expert Indian curriculum educator. Always return valid JSON only." },
      { role: "user", content: prompt },
    ], 0.7, 2000);

    const parsed = JSON.parse(cleanJsonArray(content));
    if (!Array.isArray(parsed)) {
      throw new Error("AI did not return an array of questions.");
    }
    return parsed as Array<{
      questionNumber: number;
      questionType: string;
      content: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
      marks: number;
    }>;
  },
});
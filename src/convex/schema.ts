import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
    }).index("email", ["email"]),

    // Question bank
    questions: defineTable({
      subject: v.string(), // math, physics, chemistry, biology, social_science, humanities
      topic: v.string(),
      questionType: v.string(), // mcq, numerical, short_answer, long_answer, case_study
      difficulty: v.string(), // easy, medium, hard
      bloomsLevel: v.string(), // remember, understand, apply, analyze, evaluate, create
      gradeLevel: v.string(), // class_6 through class_12
      contentEnglish: v.string(),
      options: v.optional(v.array(v.string())), // for MCQs
      correctAnswer: v.optional(v.string()),
      explanation: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      createdBy: v.optional(v.string()),
      isValidated: v.optional(v.boolean()),
      validationScore: v.optional(v.number()),
    })
      .index("by_subject", ["subject"])
      .index("by_subject_and_difficulty", ["subject", "difficulty"])
      .index("by_subject_and_grade", ["subject", "gradeLevel"]),

    // Translations of questions
    translations: defineTable({
      questionId: v.id("questions"),
      language: v.string(), // hi, ta, te, bn, mr, gu, kn, ml, pa, or, etc.
      translatedContent: v.string(),
      translatedOptions: v.optional(v.array(v.string())),
      translatedAnswer: v.optional(v.string()),
      translatedExplanation: v.optional(v.string()),
      bleuScore: v.optional(v.number()),
      semanticScore: v.optional(v.number()),
      isValidated: v.optional(v.boolean()),
      validatedBy: v.optional(v.string()),
      validatorRating: v.optional(v.number()),
    })
      .index("by_question", ["questionId"])
      .index("by_language", ["language"])
      .index("by_question_and_language", ["questionId", "language"]),

    // AI Model evaluations
    modelEvaluations: defineTable({
      modelName: v.string(),
      modelProvider: v.string(),
      questionId: v.id("questions"),
      language: v.string(),
      response: v.string(),
      isCorrect: v.optional(v.boolean()),
      score: v.optional(v.number()),
      latencyMs: v.optional(v.number()),
      tokensUsed: v.optional(v.number()),
      evaluatedAt: v.number(),
    })
      .index("by_model", ["modelName"])
      .index("by_model_and_language", ["modelName", "language"])
      .index("by_question", ["questionId"]),

    // Evaluation sessions / test runs
    evaluationSessions: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      models: v.array(v.string()),
      languages: v.array(v.string()),
      subjects: v.array(v.string()),
      status: v.string(), // pending, running, completed, failed
      totalQuestions: v.optional(v.number()),
      completedQuestions: v.optional(v.number()),
      createdBy: v.optional(v.string()),
      completedAt: v.optional(v.number()),
    }).index("by_status", ["status"]),

    // Teacher validations / feedback
    teacherFeedback: defineTable({
      questionId: v.id("questions"),
      translationId: v.optional(v.id("translations")),
      teacherEmail: v.string(),
      rating: v.number(), // 1-5
      comment: v.optional(v.string()),
      flaggedIssue: v.optional(v.string()), // translation_error, bias, difficulty_mismatch, etc.
      suggestedImprovement: v.optional(v.string()),
    })
      .index("by_question", ["questionId"])
      .index("by_teacher", ["teacherEmail"]),

    // Bias detection results
    biasReports: defineTable({
      questionId: v.id("questions"),
      biasType: v.string(), // gender, regional, socioeconomic, religious
      severity: v.string(), // low, medium, high
      description: v.string(),
      detectedBy: v.string(), // ai, human
      isResolved: v.optional(v.boolean()),
    }).index("by_question", ["questionId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
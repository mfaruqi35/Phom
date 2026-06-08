// IMPORTANT: z must be imported from @hono/zod-openapi, NOT from zod
// This extends Zod with the .openapi() decorator needed for spec generation
import { z } from "@hono/zod-openapi";

// ─── Shared primitive schemas ────────────────────────────────────────────────

export const cuidSchema = z.string().openapi({ example: "cmc1234abcdef5678" });

// ─── Error response ──────────────────────────────────────────────────────────

export const errorResponseSchema = z
  .object({
    success: z.literal(false),
    error: z.object({
      code: z.string().openapi({ example: "INTERNAL_SERVER_ERROR" }),
      message: z.string().openapi({ example: "An unexpected error occurred." }),
    }),
  })
  .openapi("ErrorResponse");

// ─── Document schemas ────────────────────────────────────────────────────────

export const documentSchema = z
  .object({
    id: cuidSchema,
    userId: cuidSchema,
    title: z.string().openapi({ example: "Skripsi Analisis Sistem" }),
    fileUrl: z
      .string()
      .url()
      .openapi({ example: "https://supabase.co/storage/v1/object/public/documents/..." }),
    totalPages: z.number().int().openapi({ example: 120 }),
    status: z.enum(["PROCESSING", "READY", "FAILED"]).openapi({ example: "READY" }),
    createdAt: z
      .string()
      .datetime()
      .openapi({ example: "2026-06-06T10:00:00.000Z" }),
  })
  .openapi("Document");

export const documentStatusSchema = z
  .object({
    status: z.enum(["PROCESSING", "READY", "FAILED"]).openapi({ example: "READY" }),
  })
  .openapi("DocumentStatus");

// ─── Chapter schemas ─────────────────────────────────────────────────────────

export const chapterSchema = z
  .object({
    id: cuidSchema,
    documentId: cuidSchema,
    label: z.string().openapi({ example: "I" }),
    title: z.string().openapi({ example: "Pendahuluan" }),
    pageStart: z.number().int().openapi({ example: 1 }),
    pageEnd: z.number().int().openapi({ example: 15 }),
    orderIndex: z.number().int().openapi({ example: 1 }),
  })
  .openapi("Chapter");

export const chapterInputSchema = z
  .object({
    label: z.string().openapi({ example: "I" }),
    title: z.string().openapi({ example: "Pendahuluan" }),
    pageStart: z.number().int().openapi({ example: 1 }),
    pageEnd: z.number().int().openapi({ example: 15 }),
    orderIndex: z.number().int().openapi({ example: 1 }),
  })
  .openapi("ChapterInput");

// ─── Session schemas ─────────────────────────────────────────────────────────

export const sessionSchema = z
  .object({
    id: cuidSchema,
    userId: cuidSchema,
    documentId: cuidSchema,
    mode: z.enum(["QUICK", "STANDARD", "DEEP"]).openapi({ example: "STANDARD" }),
    totalQuestions: z.number().int().openapi({ example: 9 }),
    currentStep: z.number().int().openapi({ example: 3 }),
    isCompleted: z.boolean().openapi({ example: false }),
    createdAt: z.string().datetime().openapi({ example: "2026-06-06T10:00:00.000Z" }),
    completedAt: z
      .string()
      .datetime()
      .nullable()
      .openapi({ example: null }),
  })
  .openapi("Session");

export const sessionChapterSchema = z
  .object({
    id: cuidSchema,
    sessionId: cuidSchema,
    chapterId: cuidSchema,
  })
  .openapi("SessionChapter");

// ─── Question schemas ─────────────────────────────────────────────────────────

export const questionSchema = z
  .object({
    id: cuidSchema,
    sessionId: cuidSchema,
    chapterId: cuidSchema,
    content: z
      .string()
      .openapi({
        example:
          "Apa yang dimaksud dengan variabel independen dalam penelitian ini?",
      }),
    orderIndex: z.number().int().openapi({ example: 1 }),
  })
  .openapi("Question");

// ─── Message schemas ──────────────────────────────────────────────────────────

export const messageSchema = z
  .object({
    id: cuidSchema,
    sessionId: cuidSchema,
    questionId: cuidSchema,
    subTurn: z.number().int().openapi({ example: 0 }),
    role: z.enum(["USER", "AI"]).openapi({ example: "USER" }),
    content: z
      .string()
      .openapi({
        example:
          "Variabel independen dalam penelitian ini adalah intensitas penggunaan media sosial.",
      }),
    createdAt: z
      .string()
      .datetime()
      .openapi({ example: "2026-06-06T10:06:00.000Z" }),
  })
  .openapi("Message");

export const evaluationResultSchema = z
  .object({
    is_satisfied: z.boolean().openapi({ example: true }),
    scores: z.object({
      methodology: z.number().openapi({ example: 4 }),
      theory: z.number().openapi({ example: 3 }),
      argument_strength: z.number().openapi({ example: 4 }),
    }),
    rebuttal: z.string().nullable().openapi({ example: null }),
    feedback: z.string().nullable().openapi({ example: null }),
  })
  .openapi("EvaluationResult");

// ─── Answer score schemas ─────────────────────────────────────────────────────

export const answerScoreSchema = z
  .object({
    id: cuidSchema,
    sessionId: cuidSchema,
    questionId: cuidSchema,
    methodologyScore: z.number().int().min(1).max(5).openapi({ example: 4 }),
    theoryScore: z.number().int().min(1).max(5).openapi({ example: 3 }),
    argumentScore: z.number().int().min(1).max(5).openapi({ example: 4 }),
    isSatisfied: z.boolean().openapi({ example: true }),
    rebuttal: z.string().nullable().openapi({ example: null }),
    feedback: z.string().nullable().openapi({ example: null }),
    createdAt: z
      .string()
      .datetime()
      .openapi({ example: "2026-06-06T10:06:30.000Z" }),
  })
  .openapi("AnswerScore");

// ─── Evaluation report schemas ────────────────────────────────────────────────

export const questionReviewSchema = z
  .object({
    question: z
      .string()
      .openapi({ example: "Apa yang dimaksud dengan variabel independen?" }),
    userAnswer: z
      .string()
      .nullable()
      .openapi({ example: "Variabel independen adalah..." }),
    isSatisfied: z.boolean().openapi({ example: true }),
    rebuttal: z.string().nullable().openapi({ example: null }),
    feedback: z.string().nullable().openapi({ example: null }),
    scores: z.object({
      methodology: z.number().openapi({ example: 4 }),
      theory: z.number().openapi({ example: 3 }),
      argument: z.number().openapi({ example: 4 }),
    }),
  })
  .openapi("QuestionReview");

export const evaluationReportSchema = z
  .object({
    session: sessionSchema,
    finalScore: z.number().openapi({ example: 72.5 }),
    breakdown: z.object({
      methodology: z.number().openapi({ example: 3.8 }),
      theory: z.number().openapi({ example: 3.2 }),
      argument: z.number().openapi({ example: 3.5 }),
    }),
    questionReviews: z.array(questionReviewSchema),
  })
  .openapi("EvaluationReport");

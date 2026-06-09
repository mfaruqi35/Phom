import { prisma } from "../lib/prisma";
import { ragApi } from "../lib/rag";

interface GenerateQuestionsInput {
  sessionId: string;
  documentId: string;
  chapterIds: string[];
  mode: string;
}

export const generateQuestionsService = async ({
  sessionId,
  documentId,
  chapterIds,
  mode,
}: GenerateQuestionsInput) => {
  if (!chapterIds || chapterIds.length === 0) {
    throw new Error("No chapters selected for question generation.");
  }

  // Double check if questions are already generated for this session to prevent race conditions
  const existingQuestions = await prisma.question.findMany({
    where: { sessionId },
    orderBy: { orderIndex: "asc" },
  });

  if (existingQuestions.length > 0) {
    console.log(`Questions already exist for session ${sessionId}, returning existing ones.`);
    return existingQuestions;
  }

  const result = await ragApi.generateQuestions({
    session_id: sessionId,
    document_id: documentId,
    chapter_ids: chapterIds,
    mode,
  });

  if (!result.questions || result.questions.length === 0) {
    throw new Error("RAG service returned no questions.");
  }

  const questions = await prisma.question.createManyAndReturn({
    data: result.questions.map((content, index) => ({
      sessionId,
      chapterId: chapterIds[0],
      content,
      orderIndex: index + 1,
    })),
  });

  await prisma.simulationSession.update({
    where: { id: sessionId },
    data: { totalQuestions: questions.length },
  });

  return questions;
};

export const getQuestionsBySessionService = async (sessionId: string) => {
  return prisma.question.findMany({
    where: { sessionId },
    orderBy: { orderIndex: "asc" },
  });
};

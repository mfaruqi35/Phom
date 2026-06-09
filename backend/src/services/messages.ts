import { prisma } from "../lib/prisma";
import { ragApi } from "../lib/rag";

interface CreateMessageInput {
  sessionId: string;
  questionId: string;
  subTurn: number;
  role: "USER" | "AI";
  content: string;
}

export const getMessagesBySessionService = async (sessionId: string) => {
  return prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
};

export const createMessageService = async (data: CreateMessageInput) => {
  const message = await prisma.message.create({ data });

  if (data.role === "AI" && data.subTurn === 0) {
    const question = await prisma.question.findUnique({
      where: { id: data.questionId },
    });
    if (question) {
      await prisma.simulationSession.update({
        where: { id: data.sessionId },
        data: { currentStep: question.orderIndex },
      });
    }
  }

  if (data.role === "USER" && data.subTurn < 2) {
    const question = await prisma.question.findUnique({
      where: { id: data.questionId },
      include: {
        session: {
          include: {
            sessionChapters: true,
            document: true,
          },
        },
      },
    });

    if (question) {
      const chapterIds = question.session.sessionChapters.map(
        (sc) => sc.chapterId,
      );

      const evaluation = await ragApi.evaluate({
        question: question.content,
        answer: data.content,
        document_id: question.session.documentId,
        chapter_ids: chapterIds,
      });

      const existingScore = await prisma.answerScore.findFirst({
        where: {
          sessionId: data.sessionId,
          questionId: data.questionId,
        },
      });

      if (existingScore) {
        await prisma.answerScore.update({
          where: { id: existingScore.id },
          data: {
            methodologyScore: evaluation.scores.methodology,
            theoryScore: evaluation.scores.theory,
            argumentScore: evaluation.scores.argument_strength,
            isSatisfied: evaluation.is_satisfied,
            rebuttal: evaluation.rebuttal ?? null,
            feedback: evaluation.feedback ?? null,
          },
        });
      } else {
        await prisma.answerScore.create({
          data: {
            sessionId: data.sessionId,
            questionId: data.questionId,
            methodologyScore: evaluation.scores.methodology,
            theoryScore: evaluation.scores.theory,
            argumentScore: evaluation.scores.argument_strength,
            isSatisfied: evaluation.is_satisfied,
            rebuttal: evaluation.rebuttal ?? null,
            feedback: evaluation.feedback ?? null,
          },
        });
      }

      return { message, evaluation };
    }
  }

  return { message, evaluation: null };
};

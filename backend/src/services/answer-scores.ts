import { prisma } from "../lib/prisma";

interface CreateAnswerScoreInput {
  sessionId: string;
  questionId: string;
  methodologyScore: number;
  theoryScore: number;
  argumentScore: number;
  isSatisfied: boolean;
  rebuttal: string | null;
}

export const getAnswerScoresBySessionService = async (sessionId: string) => {
  return prisma.answerScore.findMany({
    where: { sessionId },
    include: { question: true },
    orderBy: { createdAt: "asc" },
  });
};

export const createAnswerScoreService = async (
  data: CreateAnswerScoreInput,
) => {
  return prisma.answerScore.create({ data });
};

import { prisma } from "../lib/prisma";

export const getEvaluationService = async (sessionId: string) => {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { document: true },
  });

  if (!session) return null;

  const answerScores = await prisma.answerScore.findMany({
    where: { sessionId },
    include: {
      question: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const messages = await prisma.message.findMany({
    where: {
      sessionId,
      role: "USER",
      subTurn: 0,
    },
    orderBy: { createdAt: "asc" },
  });

  if (answerScores.length === 0) {
    return {
      session,
      finalScore: 0,
      breakdown: {
        methodology: 0,
        theory: 0,
        argument: 0,
      },
      questionReviews: [],
    };
  }

  const avgMethodology =
    answerScores.reduce((sum, s) => sum + s.methodologyScore, 0) /
    answerScores.length;

  const avgTheory =
    answerScores.reduce((sum, s) => sum + s.theoryScore, 0) /
    answerScores.length;

  const avgArgument =
    answerScores.reduce((sum, s) => sum + s.argumentScore, 0) /
    answerScores.length;

  const finalScore =
    ((avgMethodology * 0.4 + avgTheory * 0.3 + avgArgument * 0.3) / 5) * 100;

  const questionReviews = answerScores.map((score) => {
    const userMessage = messages.find((m) => m.questionId === score.questionId);

    return {
      question: score.question.content,
      userAnswer: userMessage?.content ?? null,
      isSatisfied: score.isSatisfied,
      rebuttal: score.rebuttal,
      scores: {
        methodology: score.methodologyScore,
        theory: score.theoryScore,
        argument: score.argumentScore,
      },
    };
  });

  return {
    session,
    finalScore: Math.round(finalScore * 10) / 10,
    breakdown: {
      methodology: Math.round(avgMethodology * 10) / 10,
      theory: Math.round(avgTheory * 10) / 10,
      argument: Math.round(avgArgument * 10) / 10,
    },
    questionReviews,
  };
};

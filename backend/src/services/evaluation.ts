import { stringbool } from "zod";
import { prisma } from "../lib/prisma";

export const getEvaluationService = async (sessionId: string) => {
  const session = await prisma.simulationSession.findUnique({
    where: { id: sessionId },
    include: {
      document: true,
      sessionChapters: {
        include: {
          chapter: true,
        },
      },
    },
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

  const rebuttalMessages = await prisma.message.findMany({
    where: { sessionId, role: "USER", subTurn: { gt: 0 } },
  });

  const questions = await prisma.question.findMany({
    where: { sessionId },
    include: { chapter: true },
  });

  if (answerScores.length === 0) {
    return {
      session,
      finalScore: 0,
      verdict: "Belum Siap",
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

  const roundedScore = Math.round(finalScore * 10) / 10;

  const verdict =
    roundedScore >= 85
      ? "Layak Maju Sidang"
      : roundedScore >= 70
        ? "Cukup Siap"
        : roundedScore >= 50
          ? "Perlu Persiapan"
          : "Belum Siap";

  const averageRebuttal =
    answerScores.length > 0
      ? Math.round((rebuttalMessages.length / answerScores.length) * 10) / 10
      : 0;

  const chapterMap = new Map<
    string,
    {
      chapterId: string;
      label: string;
      title: string;
      scores: { methodology: number; theory: number; argument: number }[];
    }
  >();

  if (session.sessionChapters) {
    for (const sc of session.sessionChapters) {
      chapterMap.set(sc.chapterId, {
        chapterId: sc.chapterId,
        label: sc.chapter.label,
        title: sc.chapter.title,
        scores: [],
      });
    }
  }

  for (const score of answerScores) {
    const question = questions.find((q) => q.id === score.questionId);
    if (!question) continue;

    const chapterId = question.chapterId;
    const chapter = question.chapter;

    if (!chapterMap.has(chapterId)) {
      chapterMap.set(chapterId, {
        chapterId,
        label: chapter.label,
        title: chapter.title,
        scores: [],
      });
    }

    chapterMap.get(chapterId)!.scores.push({
      methodology: score.methodologyScore,
      theory: score.theoryScore,
      argument: score.argumentScore,
    });
  }

  const chapterBreakdown = Array.from(chapterMap.values()).map((ch) => {
    if (ch.scores.length === 0) {
      return {
        chapterId: ch.chapterId,
        label: ch.label,
        title: ch.title,
        score: null,
        verdict: "BELUM DIUJI",
      };
    }

    const avg =
      ch.scores.reduce((sum, s) => {
        return (
          sum +
          ((s.methodology * 0.4 + s.theory * 0.3 + s.argument * 0.3) / 5) * 100
        );
      }, 0) / ch.scores.length;

    const chapterScore = Math.round(avg * 10) / 10;

    return {
      chapterId: ch.chapterId,
      label: ch.label,
      title: ch.title,
      score: chapterScore,
      verdict: chapterScore >= 70 ? "LULUS" : "REVISI",
    };
  });

  const questionReviews = answerScores.map((score) => {
    const userMessage = messages.find((m) => m.questionId === score.questionId);
    const question = questions.find((q) => q.id === score.questionId);

    return {
      question: score.question.content,
      userAnswer: userMessage?.content ?? null,
      chapterLabel: question?.chapter.label ?? null,
      isSatisfied: score.isSatisfied,
      rebuttal: score.rebuttal,
      feedback: score.feedback,
      scores: {
        methodology: score.methodologyScore,
        theory: score.theoryScore,
        argument: score.argumentScore,
      },
    };
  });

  return {
    session,
    finalScore: roundedScore,
    breakdown: {
      methodology: Math.round(avgMethodology * 10) / 10,
      theory: Math.round(avgTheory * 10) / 10,
      argument: Math.round(avgArgument * 10) / 10,
    },
    averageRebuttal,
    chapterBreakdown,
    questionReviews,
  };
};

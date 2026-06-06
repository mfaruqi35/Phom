import { prisma } from "../lib/prisma";

interface CreateSessionInput {
  userId: string;
  documentId: string;
  mode: "QUICK" | "STANDARD" | "DEEP";
  chapterIds: string[];
}

export const createSessionService = async ({
  userId,
  documentId,
  mode,
  chapterIds,
}: CreateSessionInput) => {
  const session = await prisma.simulationSession.create({
    data: {
      userId,
      documentId,
      mode,
      totalQuestions: 0,
      currentStep: 0,
      isCompleted: false,
      sessionChapters: {
        create: chapterIds.map((chapterId) => ({ chapterId })),
      },
    },
    include: {
      sessionChapters: true,
    },
  });

  return session;
};

export const getSessionService = async (id: string) => {
  return prisma.simulationSession.findUnique({
    where: { id },
    include: {
      sessionChapters: {
        include: { chapter: true },
      },
      document: true,
    },
  });
};

export const getUserSessionsService = async (userId: string) => {
  return prisma.simulationSession.findMany({
    where: { userId },
    include: {
      document: true,
      sessionChapters: {
        include: { chapter: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const completeSessionService = async (id: string) => {
  return prisma.simulationSession.update({
    where: { id },
    data: {
      isCompleted: true,
      completedAt: new Date(),
    },
  });
};

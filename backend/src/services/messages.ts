import { prisma } from "../lib/prisma";

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
  return prisma.message.create({ data });
};

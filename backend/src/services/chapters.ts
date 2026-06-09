import { prisma } from "../lib/prisma";

interface ChapterInput {
  label: string;
  title: string;
  pageStart: number;
  pageEnd: number;
  orderIndex: number;
}

export const getChaptersByDocumentService = async (documentId: string) => {
  return prisma.chapter.findMany({
    where: { documentId },
    orderBy: { orderIndex: "asc" },
  });
};

export const createChaptersService = async (
  documentId: string,
  chapters: ChapterInput[],
) => {
  return prisma.chapter.createMany({
    data: chapters.map((chapter) => ({
      ...chapter,
      documentId,
    })),
  });
};

export const updateChapterService = async (
  id: string,
  data: Partial<ChapterInput>,
) => {
  return prisma.chapter.update({
    where: { id },
    data,
  });
};

export const deleteChapterService = async (id: string) => {
  return prisma.chapter.delete({
    where: { id },
  });
};

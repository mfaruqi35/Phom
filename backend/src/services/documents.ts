import { prisma } from "../lib/prisma";
import { supabase } from "../lib/supabase";
import { ragApi } from "../lib/rag";

interface UploadDocumentInput {
  file: File;
  title: string;
  userId: string;
}

export const uploadDocumentService = async ({
  file,
  title,
  userId,
}: UploadDocumentInput) => {
  const fileBuffer = await file.arrayBuffer();
  const fileName = `${userId}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("documents")
    .upload(fileName, fileBuffer, {
      contentType: "application/pdf",
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from("documents")
    .getPublicUrl(fileName);

  const document = await prisma.document.create({
    data: {
      userId,
      title,
      fileUrl: urlData.publicUrl,
      totalPages: 0,
      status: "PROCESSING",
    },
  });

  triggerProcessing(document.id, urlData.publicUrl).catch((err) => {
    console.error(`Processing failed for document ${document.id}:`, err);
  });

  return document;
};

async function triggerProcessing(documentId: string, fileUrl: string) {
  try {
    // Parse Daftar Isi
    const parseResult = await ragApi.parseToc({
      document_id: documentId,
      file_url: fileUrl,
    });

    // Simpan chapters ke database
    if (parseResult.chapters && parseResult.chapters.length > 0) {
      await prisma.chapter.createMany({
        data: parseResult.chapters.map((chapter: any) => ({
          documentId,
          label: chapter.label,
          title: chapter.title,
          pageStart: chapter.page_start,
          pageEnd: chapter.page_end,
          orderIndex: chapter.order_index,
        })),
      });
    }

    const chapters = await prisma.chapter.findMany({
      where: { documentId },
    });

    await ragApi.process({
      document_id: documentId,
      file_url: fileUrl,
      chapters: chapters.map((ch) => ({
        id: ch.id,
        page_start: ch.pageStart,
        page_end: ch.pageEnd,
      })),
    });

    // Update status ke READY
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "READY" },
    });
  } catch (err) {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "FAILED" },
    });
    throw err;
  }
}

export const getDocumentStatusService = async (id: string) => {
  return prisma.document.findUnique({
    where: { id },
    select: { status: true },
  });
};

export const getUserDocumentsService = async (userId: string) => {
  return prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

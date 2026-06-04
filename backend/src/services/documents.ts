import { prisma } from "../lib/prisma";
import { supabase } from "../lib/supabase";

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

  return document;
};

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

import { Context } from "hono";
import {
  uploadDocumentService,
  getDocumentStatusService,
  getUserDocumentsService,
} from "../services/documents";

export const uploadDocuments = async (c: Context) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;

    if (!file || !title) {
      return c.json(
        {
          success: false,
          error: {
            code: "MISSING_FIELDS",
            message: "File and title are required.",
          },
        },
        400,
      );
    }

    if (file.type !== "application/pdf") {
      return c.json(
        {
          success: false,
          error: {
            code: "INVALID_FILE_TYPE",
            message: "Only PDF files are allowed.",
          },
        },
        400,
      );
    }

    const user = c.get("user");
    const userId = user.id;
    const document = await uploadDocumentService({ file, title, userId });

    return c.json({ success: true, data: document }, 201);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred.",
        },
      },
      500,
    );
  }
};

export const getDocumentStatus = async (c: Context) => {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json(
        {
          success: false,
          error: {
            code: "MISSING_PARAM",
            message: "Document ID is required.",
          },
        },
        400,
      );
    }

    const document = await getDocumentStatusService(id);

    if (!document) {
      return c.json(
        {
          success: false,
          error: {
            code: "DOCUMENT_NOT_FOUND",
            message: "Document with the given ID does not exist.",
          },
        },
        404,
      );
    }

    return c.json({ success: true, data: { status: document.status } });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred.",
        },
      },
      500,
    );
  }
};

export const getUserDocuments = async (c: Context) => {
  try {
    const user = c.get("user");
    const userId = user.id;
    const documents = await getUserDocumentsService(userId);

    return c.json({ success: true, data: documents });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred.",
        },
      },
      500,
    );
  }
};

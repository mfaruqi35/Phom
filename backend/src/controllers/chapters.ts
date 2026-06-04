import { Context } from "hono";
import {
  getChaptersByDocumentService,
  createChaptersService,
  updateChapterService,
  deleteChapterService,
} from "../services/chapters";

export const getChaptersByDocument = async (c: Context) => {
  try {
    const documentId = c.req.param("documentId");
    if (!documentId) {
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
    const chapters = await getChaptersByDocumentService(documentId);
    return c.json({ success: true, data: chapters });
  } catch (error) {
    console.error(error);
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

export const createChapters = async (c: Context) => {
  try {
    const documentId = c.req.param("documentId");
    if (!documentId) {
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
    const body = await c.req.json();

    if (!body.chapters || !Array.isArray(body.chapters)) {
      return c.json(
        {
          success: false,
          error: {
            code: "MISSING_FIELDS",
            message: "chapters array is required.",
          },
        },
        400,
      );
    }

    const chapters = await createChaptersService(documentId, body.chapters);
    return c.json({ success: true, data: chapters }, 201);
  } catch (error) {
    console.error(error);
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

export const updateChapter = async (c: Context) => {
  try {
    const id = c.req.param("id");
    if (!id) {
      return c.json(
        {
          success: false,
          error: {
            code: "MISSING_PARAM",
            message: "Chapter ID is required.",
          },
        },
        400,
      );
    }
    const body = await c.req.json();
    const chapter = await updateChapterService(id, body);
    return c.json({ success: true, data: chapter });
  } catch (error) {
    console.error(error);
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

export const deleteChapter = async (c: Context) => {
  try {
    const id = c.req.param("id");
    if (!id) {
      return c.json(
        {
          success: false,
          error: {
            code: "MISSING_PARAM",
            message: "Chapter ID is required.",
          },
        },
        400,
      );
    }
    await deleteChapterService(id);
    return c.json({ success: true, data: null });
  } catch (error) {
    console.error(error);
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

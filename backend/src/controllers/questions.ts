import { Context } from "hono";
import {
  generateQuestionsService,
  getQuestionsBySessionService,
} from "../services/questions";

export const generateQuestions = async (c: Context) => {
  try {
    const body = await c.req.json();

    if (!body.sessionId || !body.documentId || !body.chapterIds || !body.mode) {
      return c.json(
        {
          success: false,
          error: {
            code: "MISSING_FIELDS",
            message:
              "sessionId, documentId, chapterIds, and mode are required.",
          },
        },
        400,
      );
    }

    const questions = await generateQuestionsService({
      sessionId: body.sessionId,
      documentId: body.documentId,
      chapterIds: body.chapterIds,
      mode: body.mode,
    });

    return c.json({ success: true, data: questions }, 201);
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

export const getQuestionsBySession = async (c: Context) => {
  try {
    const sessionId = c.req.param("sessionId");
    if (!sessionId) {
      return c.json(
        {
          success: false,
          error: {
            code: "MISSING_PARAM",
            message: "Session Id is required.",
          },
        },
        400,
      );
    }
    const questions = await getQuestionsBySessionService(sessionId);
    return c.json({ success: true, data: questions });
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

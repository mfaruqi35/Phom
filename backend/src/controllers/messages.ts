import { Context } from "hono";
import {
  getMessagesBySessionService,
  createMessageService,
} from "../services/messages";

export const getMessagebySession = async (c: Context) => {
  try {
    const sessionId = c.req.param("sessionId");
    if (!sessionId) {
      return c.json(
        {
          success: false,
          error: {
            code: "MISSING_PARAM",
            message: "Session ID is required.",
          },
        },
        400,
      );
    }
    const messages = await getMessagesBySessionService(sessionId);
    return c.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        },
      },
      500,
    );
  }
};

export const createMessage = async (c: Context) => {
  try {
    const body = await c.req.json();

    if (!body.sessionId || !body.questionId || !body.role || !body.content) {
      return c.json(
        {
          success: false,
          error: {
            code: "MISSING_FIELDS",
            message: "sessionId, questionId, role, and content are required.",
          },
        },
        400,
      );
    }

    if (!["USER", "AI"].includes(body.role)) {
      return c.json(
        {
          success: false,
          error: {
            code: "INVALID_ROLE",
            message: "role must be USER or AI.",
          },
        },
        400,
      );
    }

    const message = await createMessageService({
      sessionId: body.sessionId,
      questionId: body.questionId,
      subTurn: body.subTurn ?? 0,
      role: body.role,
      content: body.content,
    });

    return c.json({ success: true, data: message }, 201);
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

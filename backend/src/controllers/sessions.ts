import { Context } from "hono";
import {
  createSessionService,
  getSessionService,
  getUserSessionsService,
  completeSessionService,
  deleteSessionService,
} from "../services/sessions";

export const createSession = async (c: Context) => {
  try {
    const body = await c.req.json();

    if (!body.documentId || !body.mode || !body.chapterIds) {
      return c.json(
        {
          success: false,
          error: {
            code: "MISSING_FIELDS",
            message: "documentId, mode, and chapterIds are required.",
          },
        },
        400,
      );
    }

    if (!["QUICK", "STANDARD", "DEEP"].includes(body.mode)) {
      return c.json(
        {
          success: false,
          error: {
            code: "INVALID_MODE",
            message: "mode must be QUICK, STANDARD, or DEEP.",
          },
        },
        400,
      );
    }

    const user = c.get("user");
    const userId = user.id;
    const session = await createSessionService({
      userId,
      documentId: body.documentId,
      mode: body.mode,
      chapterIds: body.chapterIds,
    });

    return c.json({ success: true, data: session }, 201);
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

export const getSession = async (c: Context) => {
  try {
    const id = c.req.param("id");
    if (!id) {
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
    const session = await getSessionService(id);

    if (!session) {
      return c.json(
        {
          success: false,
          error: {
            code: "SESSION_NOT_FOUND",
            message: "Session with the given ID does not exist.",
          },
        },
        404,
      );
    }

    return c.json({ success: true, data: session });
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

export const getUserSessions = async (c: Context) => {
  try {
    const user = c.get("user");
    const userId = user.id;
    const sessions = await getUserSessionsService(userId);
    return c.json({ success: true, data: sessions });
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

export const completeSession = async (c: Context) => {
  try {
    const id = c.req.param("id");
    if (!id) {
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
    const session = await completeSessionService(id);
    return c.json({ success: true, data: session });
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

export const deleteSession = async (c: Context) => {
  try {
    const id = c.req.param("id");
    if (!id) {
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
    await deleteSessionService(id);
    return c.json({
      success: true,
      data: null,
    });
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

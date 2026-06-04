import { Context } from "hono";
import { getEvaluationService } from "../services/evaluation";

export const getEvaluation = async (c: Context) => {
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
    const evaluation = await getEvaluationService(sessionId);

    if (!evaluation) {
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

    return c.json({ success: true, data: evaluation });
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

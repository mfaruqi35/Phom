import { Context } from "hono";
import {
  getAnswerScoresBySessionService,
  createAnswerScoreService,
} from "../services/answer-scores";

export const getAnswerScoresBySession = async (c: Context) => {
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
    const scores = await getAnswerScoresBySessionService(sessionId);
    return c.json({ success: true, data: scores });
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

export const createAnswerScore = async (c: Context) => {
  try {
    const body = await c.req.json();

    if (
      !body.sessionId ||
      !body.questionId ||
      body.methodologyScore === undefined ||
      body.theoryScore === undefined ||
      body.argumentScore === undefined ||
      body.isSatisfied === undefined
    ) {
      return c.json(
        {
          success: false,
          error: {
            code: "MISSING_FIELDS",
            message:
              "sessionId, questionId, methodologyScore, theoryScore, argumentScore, and isSatisfied are required.",
          },
        },
        400,
      );
    }

    const score = await createAnswerScoreService({
      sessionId: body.sessionId,
      questionId: body.questionId,
      methodologyScore: body.methodologyScore,
      theoryScore: body.theoryScore,
      argumentScore: body.argumentScore,
      isSatisfied: body.isSatisfied,
      rebuttal: body.rebuttal ?? null,
    });

    return c.json({ success: true, data: score }, 201);
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

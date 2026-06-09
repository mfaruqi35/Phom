import { Hono } from "hono";
import {
  getAnswerScoresBySession,
  createAnswerScore,
} from "../controllers/answer-scores";

const answerScores = new Hono();

answerScores.get("/:sessionId", getAnswerScoresBySession);
answerScores.post("/", createAnswerScore);

export default answerScores;

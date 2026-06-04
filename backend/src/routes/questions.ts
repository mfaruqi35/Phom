import { Hono } from "hono";
import {
  generateQuestions,
  getQuestionsBySession,
} from "../controllers/questions";

const questions = new Hono();

questions.post("/generate", generateQuestions);
questions.get("/:sessionId", getQuestionsBySession);

export default questions;

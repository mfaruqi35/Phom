import { Hono } from "hono";
import { getEvaluation } from "../controllers/evaluation";

const evaluation = new Hono();

evaluation.get("/:sessionId", getEvaluation);

export default evaluation;

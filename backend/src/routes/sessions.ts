import { Hono } from "hono";
import {
  createSession,
  getSession,
  getUserSessions,
  completeSession,
} from "../controllers/sessions";

const sessions = new Hono();

sessions.post("/", createSession);
sessions.get("/user", getUserSessions);
sessions.get("/:id", getSession);
sessions.patch("/:id/complete", completeSession);

export default sessions;

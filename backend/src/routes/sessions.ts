import { Hono } from "hono";
import {
  createSession,
  getSession,
  getUserSessions,
  completeSession,
  deleteSession,
} from "../controllers/sessions";

const sessions = new Hono();

sessions.post("/", createSession);
sessions.get("/user", getUserSessions);
sessions.get("/:id", getSession);
sessions.patch("/:id/complete", completeSession);
sessions.delete("/:id", deleteSession);

export default sessions;

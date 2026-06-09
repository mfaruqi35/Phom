import { Hono } from "hono";
import { getMessagebySession, createMessage } from "../controllers/messages";

const messages = new Hono();

messages.get("/:sessionId", getMessagebySession);
messages.post("/", createMessage);

export default messages;

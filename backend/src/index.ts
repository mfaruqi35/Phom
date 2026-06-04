import { Hono } from "hono";
import { auth } from "./lib/auth";
import documents from "./routes/documents";
import chapters from "./routes/chapters";
import sessions from "./routes/sessions";
import messages from "./routes/messages";
import answerScores from "./routes/answer-scores";

const app = new Hono();

app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

app.route("/api/documents", documents);
app.route("/api/chapters", chapters);
app.route("/api/sessions", sessions);
app.route("/api/messages", messages);
app.route("/api/answer-scores", answerScores);

export default {
  port: 3000,
  fetch: app.fetch,
};

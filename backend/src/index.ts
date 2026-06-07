import { Hono } from "hono";
import { auth } from "./lib/auth";
import { cors } from "hono/cors";
import { swaggerApp } from "./lib/swagger";
import documents from "./routes/documents";
import chapters from "./routes/chapters";
import sessions from "./routes/sessions";
import messages from "./routes/messages";
import answerScores from "./routes/answer-scores";
import evaluation from "./routes/evaluation";
import questions from "./routes/questions";
import { authMiddleware } from "./middleware/auth";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);



app.all("/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.use("/api/*", authMiddleware);

app.route("/api/documents", documents);
app.route("/api/chapters", chapters);
app.route("/api/sessions", sessions);
app.route("/api/messages", messages);
app.route("/api/answer-scores", answerScores);
app.route("/api/evaluation", evaluation);
app.route("/api/questions", questions);

// Swagger UI & OpenAPI spec — mounted LAST so actual API routes take priority
app.route("/", swaggerApp);

export default {
  port: 3001,
  fetch: app.fetch,
};

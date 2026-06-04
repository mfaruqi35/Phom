import { Hono } from "hono";
import { auth } from "./lib/auth";
import documents from "./routes/documents";
import chapters from "./routes/chapters";

const app = new Hono();

app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

app.route("/api/documents", documents);
app.route("/api/chapters", chapters);

export default {
  port: 3000,
  fetch: app.fetch,
};

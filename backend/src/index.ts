import { Hono } from "hono";
import { auth } from "./lib/auth";
import documents from "./routes/documents";

const app = new Hono();

app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

app.route("/api/documents", documents);

export default {
  port: 3000,
  fetch: app.fetch,
};

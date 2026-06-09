import { Context, Next } from "hono";
import { auth } from "../lib/auth";

export const authMiddleware = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged to access this resource.",
        },
      },
      401,
    );
  }
  c.set("user", session.user);
  await next();
};

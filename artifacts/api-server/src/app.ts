import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";
import { db, redirectsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/assets", express.static(path.join(__dirname, "../public")));
app.use("/api", router);

// Short-path redirect: /:slug → destination URL (no /api/r/ prefix)
app.get("/:slug", async (req, res, next) => {
  const { slug } = req.params;
  if (!/^[a-zA-Z0-9_-]{4,32}$/.test(slug)) return next();
  try {
    const rows = await db.select().from(redirectsTable).where(eq(redirectsTable.slug, slug));
    if (!rows.length) return next();
    await db.update(redirectsTable)
      .set({ clickCount: sql`click_count + 1` })
      .where(eq(redirectsTable.slug, slug));
    res.redirect(302, rows[0].destinationUrl);
  } catch {
    next();
  }
});

export default app;

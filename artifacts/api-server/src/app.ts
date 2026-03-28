import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";
import { db, redirectsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

declare global {
  namespace Express {
    interface Request {
      userUid?: string;
      userEmail?: string;
    }
  }
}

function decodeJwt(token: string): { sub?: string; email?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// User identity middleware — decode Firebase ID token (no verification, private tool)
app.use((req: Request, _res: Response, next: NextFunction) => {
  const auth = req.headers["authorization"];
  if (auth?.startsWith("Bearer ")) {
    const payload = decodeJwt(auth.slice(7));
    if (payload) {
      req.userUid = payload.sub;
      req.userEmail = payload.email;
    }
  }
  next();
});

app.use("/api/assets", express.static(path.join(__dirname, "../public")));
app.use("/api", router);

// Short redirect at /r/:slug
app.get("/r/:slug", async (req, res, next) => {
  const { slug } = req.params;
  try {
    const rows = await db.select().from(redirectsTable).where(eq(redirectsTable.slug, slug));
    if (!rows.length) return res.status(404).send("Enlace no encontrado");
    await db.update(redirectsTable)
      .set({ clickCount: sql`click_count + 1` })
      .where(eq(redirectsTable.slug, slug));
    res.redirect(302, rows[0].destinationUrl);
  } catch {
    next();
  }
});

export default app;

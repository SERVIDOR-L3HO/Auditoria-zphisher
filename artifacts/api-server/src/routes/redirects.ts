import { Router, type IRouter } from "express";
import { db, redirectsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import crypto from "crypto";

const router: IRouter = Router();

router.get("/r/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const rows = await db.select().from(redirectsTable).where(eq(redirectsTable.slug, slug));
    if (!rows.length) return res.status(404).send("Enlace no encontrado");
    await db.update(redirectsTable)
      .set({ clickCount: sql`click_count + 1` })
      .where(eq(redirectsTable.slug, slug));
    res.redirect(302, rows[0].destinationUrl);
  } catch (e) {
    res.status(500).send("Error");
  }
});

router.get("/redirects", async (_req, res) => {
  try {
    const rows = await db.select().from(redirectsTable).orderBy(desc(redirectsTable.createdAt));
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Error fetching redirects" });
  }
});

router.post("/redirects", async (req, res) => {
  const { name, destinationUrl, slug: customSlug } = req.body;
  if (!name || !destinationUrl) return res.status(400).json({ error: "Name and destinationUrl required" });

  let url = destinationUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;

  const slug = customSlug?.trim().toLowerCase().replace(/[^a-z0-9\-_]/g, "") || crypto.randomBytes(4).toString("hex");
  try {
    const result = await db.insert(redirectsTable).values({ slug, name, destinationUrl: url }).returning();
    res.json(result[0]);
  } catch (e: any) {
    if (e?.code === "23505") return res.status(409).json({ error: "El identificador ya está en uso, elige otro" });
    res.status(500).json({ error: "Error creating redirect" });
  }
});

router.delete("/redirects/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    await db.delete(redirectsTable).where(eq(redirectsTable.slug, slug));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Error deleting redirect" });
  }
});

export default router;

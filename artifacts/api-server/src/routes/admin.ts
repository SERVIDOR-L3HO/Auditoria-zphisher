import { Router, type IRouter } from "express";
import { db, campaignsTable, locationSessionsTable, locationsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

const ADMIN_EMAIL = "servidorl3ho@gmail.com";

router.get("/admin/overview", async (req, res) => {
  if (req.userEmail !== ADMIN_EMAIL) {
    return res.status(403).json({ error: "Acceso denegado" });
  }

  const [sessions, campaigns, allLocations] = await Promise.all([
    db.select().from(locationSessionsTable).orderBy(desc(locationSessionsTable.createdAt)),
    db.select().from(campaignsTable).orderBy(desc(campaignsTable.createdAt)),
    db.select().from(locationsTable).orderBy(desc(locationsTable.capturedAt)),
  ]);

  // Group by user
  const userMap = new Map<string, {
    uid: string;
    email: string;
    sessions: typeof sessions;
    campaigns: typeof campaigns;
    lastActivity: string | null;
  }>();

  const upsertUser = (uid: string, email: string) => {
    const key = uid || email || "desconocido";
    if (!userMap.has(key)) {
      userMap.set(key, { uid, email, sessions: [], campaigns: [], lastActivity: null });
    }
    return userMap.get(key)!;
  };

  for (const s of sessions) {
    const u = upsertUser(s.ownerUid ?? "", s.ownerEmail ?? "Sin usuario");
    u.sessions.push(s);
    const t = s.createdAt.toISOString();
    if (!u.lastActivity || t > u.lastActivity) u.lastActivity = t;
  }

  for (const c of campaigns) {
    const u = upsertUser(c.ownerUid ?? "", c.ownerEmail ?? "Sin usuario");
    u.campaigns.push(c);
    const t = c.createdAt.toISOString();
    if (!u.lastActivity || t > u.lastActivity) u.lastActivity = t;
  }

  const users = Array.from(userMap.values()).sort((a, b) =>
    (b.lastActivity ?? "") > (a.lastActivity ?? "") ? 1 : -1
  );

  res.json({
    totals: {
      users: users.length,
      sessions: sessions.length,
      campaigns: campaigns.length,
      capturedLocations: allLocations.length,
    },
    users,
  });
});

export { ADMIN_EMAIL };
export default router;

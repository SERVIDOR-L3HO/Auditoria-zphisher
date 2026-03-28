import { Router } from "express";
import healthRouter from "./health.js";
import campaignsRouter from "./campaigns.js";
import templatesRouter from "./templates.js";
import capturesRouter from "./captures.js";
import sessionsRouter from "./sessions.js";
import statsRouter from "./stats.js";
import phishRouter from "./phish.js";
import locationsRouter from "./locations.js";
import redirectsRouter from "./redirects.js";
import curpLookupRouter from "./curp-lookup.js";
import adminRouter from "./admin.js";

const router = Router();

router.use(healthRouter);
router.use(campaignsRouter);
router.use(templatesRouter);
router.use(capturesRouter);
router.use(sessionsRouter);
router.use(statsRouter);
router.use(phishRouter);
router.use(locationsRouter);
router.use(redirectsRouter);
router.use(curpLookupRouter);
router.use(adminRouter);

export default router;

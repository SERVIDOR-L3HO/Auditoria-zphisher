import { Router } from "express";
import healthRouter from "./health.js";
import campaignsRouter from "./campaigns.js";
import templatesRouter from "./templates.js";
import capturesRouter from "./captures.js";
import sessionsRouter from "./sessions.js";
import statsRouter from "./stats.js";

const router = Router();

router.use(healthRouter);
router.use(campaignsRouter);
router.use(templatesRouter);
router.use(capturesRouter);
router.use(sessionsRouter);
router.use(statsRouter);

export default router;

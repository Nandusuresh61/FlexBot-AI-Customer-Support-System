import { Router } from "express";

import { externalController } from "../../composition/container.js";
import { apiKeyAuthMiddleware } from "../middlewares/api-key,middleware.js";

const router = Router();

router.use(apiKeyAuthMiddleware);

router.get("/identity", externalController.identity);

export default router;
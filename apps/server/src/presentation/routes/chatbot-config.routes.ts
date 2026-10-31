import { Router } from "express";
import { chatbotConfigController } from "../../composition/container.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { organizationAccessMiddleware } from "../middlewares/organization-access.middleware.js";
import { requireOrganizationRole } from "../middlewares/require-organization-role.middleware.js";
const router = Router({ mergeParams: true });

router.use(authMiddleware);
router.use(organizationAccessMiddleware);
router.use(requireOrganizationRole("ORG_ADMIN"));

router.post("/", chatbotConfigController.create);
router.get("/", chatbotConfigController.get);
router.patch("/", chatbotConfigController.update);

export default router;
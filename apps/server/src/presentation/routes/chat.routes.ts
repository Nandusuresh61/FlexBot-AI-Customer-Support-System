import { Router } from "express";
import { chatController } from "../../composition/container.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { organizationAccessMiddleware } from "../middlewares/organization-access.middleware.js";
import { requireOrganizationRole } from "../middlewares/require-organization-role.middleware.js";
const router = Router({ mergeParams: true });

router.use(authMiddleware);
router.use(organizationAccessMiddleware);
router.use(requireOrganizationRole("ORG_ADMIN", "ORG_MEMBER"));

router.post("/messages", chatController.sendMessage);

export default router;
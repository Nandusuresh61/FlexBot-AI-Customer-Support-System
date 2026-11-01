import { Router } from "express";
import { conversationController } from "../../composition/container.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { organizationAccessMiddleware } from "../middlewares/organization-access.middleware.js";
import { requireOrganizationRole } from "../middlewares/require-organization-role.middleware.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);
router.use(organizationAccessMiddleware);
router.use(requireOrganizationRole("ORG_ADMIN", "ORG_MEMBER"));

router.post("/", conversationController.create);
router.post("/:conversationId/messages", conversationController.sendMessage);

export default router;
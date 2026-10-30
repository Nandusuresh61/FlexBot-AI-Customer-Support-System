import { Router } from "express";

import { apiKeyController } from "../../composition/container.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { organizationAccessMiddleware } from "../middlewares/organization-access.middleware.js";
import { requireOrganizationRole } from "../middlewares/require-organization-role.middleware.js";

const router = Router({ mergeParams: true });

router.use(
  authMiddleware,
  organizationAccessMiddleware,
  requireOrganizationRole("ORG_ADMIN"),
);

// Create API key
router.post("/", apiKeyController.create);

// List organization API keys
router.get("/", apiKeyController.list);

// Revoke API key
router.delete("/:apiKeyId", apiKeyController.revoke);

export default router;
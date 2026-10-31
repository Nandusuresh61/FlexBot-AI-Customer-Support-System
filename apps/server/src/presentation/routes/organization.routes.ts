import { Router } from "express";
import {
  organizationController,
  membershipController,
} from "../../composition/container.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { organizationAccessMiddleware } from "../middlewares/organization-access.middleware.js";
import { requireOrganizationRole } from "../middlewares/require-organization-role.middleware.js";
import apiKeyRoutes from "./api-key.routes.js";
import chatbotConfigRoutes from "./chatbot-config.routes.js";

const organizationRouter = Router();

organizationRouter.post("/", authMiddleware, organizationController.create);

organizationRouter.get(
  "/:organizationId",
  authMiddleware,
  organizationAccessMiddleware,
  organizationController.getById,
);

organizationRouter.post(
  "/:organizationId/members",
  authMiddleware,
  organizationAccessMiddleware,
  requireOrganizationRole("ORG_ADMIN"),
  membershipController.createMember,
);

organizationRouter.get(
  "/:organizationId/members",
  authMiddleware,
  organizationAccessMiddleware,
  membershipController.getMembers,
);

organizationRouter.delete(
  "/:organizationId/members/:membershipId",
  authMiddleware,
  organizationAccessMiddleware,
  requireOrganizationRole("ORG_ADMIN"),
  membershipController.suspendMember,
);

organizationRouter.use("/:organizationId/api-keys", apiKeyRoutes);

organizationRouter.use("/:organizationId/chatbot-config", chatbotConfigRoutes);
export default organizationRouter;

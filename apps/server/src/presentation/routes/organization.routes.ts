import { Router } from "express";
import {
  organizationController,
  membershipController,
  knowledgeDocumentController,
} from "../../composition/container.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { organizationAccessMiddleware } from "../middlewares/organization-access.middleware.js";
import { requireOrganizationRole } from "../middlewares/require-organization-role.middleware.js";
import apiKeyRoutes from "./api-key.routes.js";
import chatbotConfigRoutes from "./chatbot-config.routes.js";
import chatRoutes from "./chat.routes.js";
import conversationRoutes from "./conversation.routes.js";
import { uploadKnowledgeDocument } from "../middlewares/knowledge-document-upload.middleware.js";

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

organizationRouter.use("/:organizationId/chat", chatRoutes);

organizationRouter.use("/:organizationId/conversations", conversationRoutes);

organizationRouter.post(
  "/:organizationId/knowledge-documents",
  authMiddleware,
  organizationAccessMiddleware,
  requireOrganizationRole("ORG_ADMIN"),
  uploadKnowledgeDocument,
  knowledgeDocumentController.create,
);
export default organizationRouter;

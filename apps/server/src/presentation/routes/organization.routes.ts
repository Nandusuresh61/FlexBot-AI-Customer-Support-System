import { Router } from "express";
import {
  createOrganizationController,
  getOrganizationByIdController,
} from "../controllers/organization.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { organizationAccessMiddleware } from "../middlewares/organization-access.middleware";

import { requireOrganizationRole } from "../middlewares/require-organization-role.middleware";
import { createOrganizationMemberController } from "../controllers/membership.controller";
import { getOrganizationMembersController } from "../controllers/organization-members.controller";
import { suspendOrganizationMemberController } from "../controllers/suspend-organization-member.controller.js";
const organizationRouter = Router();

organizationRouter.post("/", authMiddleware, createOrganizationController);

organizationRouter.get(
  "/:organizationId",
  authMiddleware,
  organizationAccessMiddleware,
  getOrganizationByIdController,
);

organizationRouter.post(
  "/:organizationId/members",
  authMiddleware,
  organizationAccessMiddleware,
  requireOrganizationRole("ORG_ADMIN"),
  createOrganizationMemberController,
);

organizationRouter.get(
  "/:organizationId/members",
  authMiddleware,
  organizationAccessMiddleware,
  getOrganizationMembersController,
);

organizationRouter.delete(
  "/:organizationId/members/:membershipId",
  authMiddleware,
  organizationAccessMiddleware,
  requireOrganizationRole("ORG_ADMIN"),
  suspendOrganizationMemberController,
);

export default organizationRouter;

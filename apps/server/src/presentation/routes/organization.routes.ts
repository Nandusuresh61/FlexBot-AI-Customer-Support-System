import { Router } from "express";
import { createOrganizationController, getOrganizationByIdController } from "../controllers/organization.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { organizationAccessMiddleware } from "../middlewares/organization-access.middleware";



const organizationRouter = Router();

organizationRouter.post(
  "/",
  authMiddleware,
  createOrganizationController,
);

organizationRouter.get(
  "/:organizationId",
  authMiddleware,
  organizationAccessMiddleware,
  getOrganizationByIdController,
);

export default organizationRouter;
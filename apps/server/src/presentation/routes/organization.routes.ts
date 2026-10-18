import { Router } from "express";
import { createOrganizationController, getOrganizationByIdController } from "../controllers/organization.controller";



const organizationRouter = Router();

organizationRouter.post(
  "/",
  createOrganizationController,
);

organizationRouter.get(
  "/:organizationId",
  getOrganizationByIdController,
);

export default organizationRouter;
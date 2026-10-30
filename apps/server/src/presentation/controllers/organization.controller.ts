import type { Request, Response } from "express";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";
import { ResponseHandler } from "../utils/responseHandler.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

import type { CreateOrganizationUseCase } from "../../application/use-cases/create-organization.use-case.js";
import type { GetOrganizationByIdUseCase } from "../../application/use-cases/get-organization-by-id.use-case.js";

export class OrganizationController {
  constructor(
    private readonly _createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly _getOrganizationByIdUseCase: GetOrganizationByIdUseCase,
  ) {}

  create = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.auth?.userId) {
      ResponseHandler.error(
        res,
        HttpStatusCode.UNAUTHORIZED,
        AppMessage.AUTH_REQUIRED,
      );
      return;
    }

    const organization = await this._createOrganizationUseCase.execute(
      req.body,
      req.auth.userId,
    );

    ResponseHandler.success(
      res,
      HttpStatusCode.CREATED,
      AppMessage.ORGANIZATION_CREATED,
      {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        status: organization.status,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      },
    );
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const organization = await this._getOrganizationByIdUseCase.execute(
      req.params.organizationId as string,
    );

    ResponseHandler.success(
      res,
      HttpStatusCode.OK,
      AppMessage.ORGANIZATION_RETRIEVED,
      {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        status: organization.status,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      },
    );
  });
}
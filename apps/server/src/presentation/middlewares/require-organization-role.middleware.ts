import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../domain/errors/app-error.js";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";
import type { OrganizationRole } from "../../domain/entities/membership.entity.js";
import type { OrganizationAuthenticatedRequest } from "./organization-access.middleware.js";

export function requireOrganizationRole(
  ...allowedRoles: OrganizationRole[]
) {
  return (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): void => {
    const authenticatedReq =
      req as OrganizationAuthenticatedRequest;

    const organizationAccess =
      authenticatedReq.organizationAccess;

    if (!organizationAccess) {
      next(
        new AppError(
          AppMessage.ORGANIZATION_ACCESS_REQUIRED,
          HttpStatusCode.FORBIDDEN,
        ),
      );
      return;
    }

    if (!allowedRoles.includes(organizationAccess.role)) {
      next(
        new AppError(
          AppMessage.ORGANIZATION_PERMISSION_DENIED,
          HttpStatusCode.FORBIDDEN,
        ),
      );
      return;
    }

    next();
  };
}
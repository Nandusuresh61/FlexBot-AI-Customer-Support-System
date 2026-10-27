import type { Request, Response, NextFunction } from "express";

import { AppError } from "../../domain/errors/app-error.js";
import type { OrganizationRole } from "../../domain/entities/membership.entity.js";
import type {
  OrganizationAuthenticatedRequest,
} from "./organization-access.middleware.js";

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
      next(new AppError("Organization access must be verified first", 403));
      return;
    }

    if (!allowedRoles.includes(organizationAccess.role)) {
      next(new AppError("You do not have permission to perform this action", 403));
      return;
    }

    next();
  };
}
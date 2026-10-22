import type { Request, Response, NextFunction } from "express";

import { AppError } from "../../domain/errors/app-error.js";
import { membershipRepository } from "../../composition/container.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";

export interface OrganizationAuthenticatedRequest extends AuthenticatedRequest {
  organizationAccess?: {
    organizationId: string;
    role: "ORG_ADMIN" | "ORG_MEMBER";
    membershipId: string;
  };
}

export async function organizationAccessMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authenticatedReq = req as OrganizationAuthenticatedRequest;

    const userId = authenticatedReq.auth?.userId;

    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    const organizationId = req.params.organizationId;

    if (!organizationId) {
      throw new AppError("Organization ID is required", 400);
    }

    if (typeof organizationId !== "string" || !organizationId.trim()) {
      throw new AppError("A valid organization ID is required", 400);
    }

    const membership = await membershipRepository.findByUserAndOrganization(
      userId,
      organizationId,
    );

    if (!membership) {
      throw new AppError("You do not have access to this organization", 403);
    }

    authenticatedReq.organizationAccess = {
      organizationId,
      role: membership.role,
      membershipId: membership.id,
    };

    next();
  } catch (error: unknown) {
    next(error);
  }
}

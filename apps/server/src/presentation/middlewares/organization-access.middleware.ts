import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../domain/errors/app-error.js";
import {
  membershipRepository,
  organizationRepository,
} from "../../composition/container.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";
import { asyncHandler } from "./asyncHandler.js";

export interface OrganizationAuthenticatedRequest extends AuthenticatedRequest {
  organizationAccess?: {
    organizationId: string;
    role: "ORG_ADMIN" | "ORG_MEMBER";
    membershipId: string;
  };
}

export const organizationAccessMiddleware = asyncHandler(
  async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const authenticatedReq = req as OrganizationAuthenticatedRequest;
    const userId = authenticatedReq.auth?.userId;

    if (!userId) {
      throw new AppError(
        AppMessage.AUTH_REQUIRED,
        HttpStatusCode.UNAUTHORIZED,
      );
    }

    const organizationId = req.params.organizationId;

    if (typeof organizationId !== "string" || !organizationId.trim()) {
      throw new AppError(
        AppMessage.ORGANIZATION_ID_REQUIRED,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const membership = await membershipRepository.findByUserAndOrganization(
      userId,
      organizationId,
    );

    if (!membership) {
      throw new AppError(
        AppMessage.ORGANIZATION_ACCESS_DENIED,
        HttpStatusCode.FORBIDDEN,
      );
    }

    if (membership.status !== "ACTIVE") {
      throw new AppError(
        AppMessage.MEMBERSHIP_SUSPENDED,
        HttpStatusCode.FORBIDDEN,
      );
    }

    const organization =
      await organizationRepository.findById(organizationId);

    if (!organization) {
      throw new AppError(
        AppMessage.ORGANIZATION_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    if (organization.status !== "ACTIVE") {
      throw new AppError(
        AppMessage.ORGANIZATION_SUSPENDED,
        HttpStatusCode.FORBIDDEN,
      );
    }

    authenticatedReq.organizationAccess = {
      organizationId,
      role: membership.role,
      membershipId: membership.id,
    };

    next();
  },
);
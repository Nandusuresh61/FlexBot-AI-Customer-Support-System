import type { Request, Response } from "express";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";
import { AppError } from "../../domain/errors/app-error.js";
import { ResponseHandler } from "../utils/responseHandler.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

import type { CreateMembershipUseCase } from "../../application/use-cases/create-membership.use-case.js";
import type { GetOrganizationMembersUseCase } from "../../application/use-cases/get-organization-members.use-case.js";
import type { SuspendOrganizationMemberUseCase } from "../../application/use-cases/suspend-organization-member.use-case.js";

export class MembershipController {
  constructor(
    private readonly _createMembershipUseCase: CreateMembershipUseCase,
    private readonly _getOrganizationMembersUseCase: GetOrganizationMembersUseCase,
    private readonly _suspendOrganizationMemberUseCase: SuspendOrganizationMemberUseCase,
  ) {}

  createMember = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const organizationId = req.params.organizationId;

    if (typeof organizationId !== "string" || !organizationId.trim()) {
      throw new AppError(
        AppMessage.ORGANIZATION_ID_REQUIRED,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const membership = await this._createMembershipUseCase.execute({
      userId: req.body?.userId,
      organizationId,
    });

    ResponseHandler.success(
      res,
      HttpStatusCode.CREATED,
      AppMessage.MEMBER_ADDED,
      {
        id: membership.id,
        userId: membership.userId,
        organizationId: membership.organizationId,
        role: membership.role,
        status: membership.status,
        createdAt: membership.createdAt,
      },
    );
  });

  getMembers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const organizationId = req.params.organizationId;

    if (typeof organizationId !== "string" || !organizationId.trim()) {
      throw new AppError(
        AppMessage.ORGANIZATION_ID_REQUIRED,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const memberships =
      await this._getOrganizationMembersUseCase.execute(organizationId);

    ResponseHandler.success(
      res,
      HttpStatusCode.OK,
      AppMessage.MEMBERS_RETRIEVED,
      memberships.map((membership) => ({
        id: membership.id,
        userId: membership.userId,
        organizationId: membership.organizationId,
        role: membership.role,
        status: membership.status,
        createdAt: membership.createdAt,
      })),
    );
  });

  suspendMember = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { organizationId, membershipId } = req.params;

    if (
      typeof organizationId !== "string" ||
      !organizationId.trim() ||
      typeof membershipId !== "string" ||
      !membershipId.trim()
    ) {
      throw new AppError(
        AppMessage.INVALID_ORG_MEMBER_IDS,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const membership = await this._suspendOrganizationMemberUseCase.execute({
      organizationId,
      membershipId,
    });

    ResponseHandler.success(
      res,
      HttpStatusCode.OK,
      AppMessage.MEMBER_SUSPENDED,
      {
        id: membership.id,
        userId: membership.userId,
        organizationId: membership.organizationId,
        role: membership.role,
        status: membership.status,
        updatedAt: membership.updatedAt,
      },
    );
  });
}

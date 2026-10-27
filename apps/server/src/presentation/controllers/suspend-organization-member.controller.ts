import type { Request, Response, NextFunction } from "express";

import { AppError } from "../../domain/errors/app-error.js";
import { suspendOrganizationMemberUseCase } from "../../composition/container.js";

export async function suspendOrganizationMemberController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { organizationId, membershipId } = req.params;

    if (
      typeof organizationId !== "string" ||
      !organizationId.trim() ||
      typeof membershipId !== "string" ||
      !membershipId.trim()
    ) {
      throw new AppError(
        "Valid organization and membership IDs are required",
        400,
      );
    }

    const membership = await suspendOrganizationMemberUseCase.execute({
      organizationId,
      membershipId,
    });

    res.status(200).json({
      success: true,
      message: "Organization member suspended successfully",
      data: {
        id: membership.id,
        userId: membership.userId,
        organizationId: membership.organizationId,
        role: membership.role,
        status: membership.status,
        updatedAt: membership.updatedAt,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}
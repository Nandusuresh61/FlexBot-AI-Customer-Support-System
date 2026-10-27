import type { Request, Response, NextFunction } from "express";

import { AppError } from "../../domain/errors/app-error.js";
import { getOrganizationMembersUseCase } from "../../composition/container.js";

export async function getOrganizationMembersController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const organizationId = req.params.organizationId;

    if (typeof organizationId !== "string" || !organizationId.trim()) {
      throw new AppError("A valid organization ID is required", 400);
    }

    const memberships =
      await getOrganizationMembersUseCase.execute(organizationId);

    res.status(200).json({
      success: true,
      data: memberships.map((membership) => ({
        id: membership.id,
        userId: membership.userId,
        organizationId: membership.organizationId,
        role: membership.role,
        status: membership.status,
        createdAt: membership.createdAt,
      })),
    });
  } catch (error: unknown) {
    next(error);
  }
}
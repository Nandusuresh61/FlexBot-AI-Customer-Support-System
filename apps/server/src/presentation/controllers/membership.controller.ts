import type { Request, Response, NextFunction } from "express";

import { AppError } from "../../domain/errors/app-error.js";
import { createMembershipUseCase } from "../../composition/container.js";

export async function createOrganizationMemberController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const organizationId = req.params.organizationId;

    if (typeof organizationId !== "string" || !organizationId.trim()) {
      throw new AppError("A valid organization ID is required", 400);
    }

    const membership = await createMembershipUseCase.execute({
      userId: req.body?.userId,
      organizationId,
    });

    res.status(201).json({
      success: true,
      message: "Organization member added successfully",
      data: {
        id: membership.id,
        userId: membership.userId,
        organizationId: membership.organizationId,
        role: membership.role,
        status: membership.status,
        createdAt: membership.createdAt,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}

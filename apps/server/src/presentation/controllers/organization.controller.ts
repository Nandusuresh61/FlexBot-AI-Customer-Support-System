import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  createOrganizationUseCase,
  getOrganizationByIdUseCase,
} from "../../composition/container.js";

export async function createOrganizationController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const organization = await createOrganizationUseCase.execute(
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Organization created successfully",
      data: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        status: organization.status,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getOrganizationByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const organization = await getOrganizationByIdUseCase.execute(
      req.params.organizationId as string,
    );

    res.status(200).json({
      success: true,
      data: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        status: organization.status,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}
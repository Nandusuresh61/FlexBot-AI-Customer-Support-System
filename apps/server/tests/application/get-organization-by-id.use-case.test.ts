import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "../../src/domain/errors/app-error.js";
import { Organization } from "../../src/domain/entities/organization.entity.js";
import type { OrganizationRepository } from "../../src/domain/repositories/organization.repository.js";
import { GetOrganizationByIdUseCase } from "../../src/application/use-cases/get-organization-by-id.use-case.js";

describe("GetOrganizationByIdUseCase", () => {
  let repository: OrganizationRepository;
  let useCase: GetOrganizationByIdUseCase;

  beforeEach(() => {
    repository = {
      create: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
    };

    useCase = new GetOrganizationByIdUseCase(repository);
  });

  it("returns an organization when it exists", async () => {
    const organization = new Organization({
      id: "org-123",
      name: "Acme Support",
      slug: "acme-support",
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(repository.findById).mockResolvedValue(organization);

    const result = await useCase.execute("org-123");

    expect(repository.findById).toHaveBeenCalledWith("org-123");
    expect(result).toEqual(organization);
  });

  it("throws a 404 error when the organization does not exist", async () => {
    vi.mocked(repository.findById).mockResolvedValue(null);

    await expect(
      useCase.execute("org-missing"),
    ).rejects.toMatchObject({
      message: "Organization not found",
      statusCode: 404,
    } satisfies Partial<AppError>);
  });

  it("rejects an empty organization ID", async () => {
    await expect(useCase.execute("   ")).rejects.toThrow();

    expect(repository.findById).not.toHaveBeenCalled();
  });
});
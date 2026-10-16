import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "../../src/domain/errors/app-error.js";
import {
  Organization,
  type OrganizationStatus,
} from "../../src/domain/entities/organization.entity.js";
import type {
  OrganizationRepository,
  CreateOrganizationInput,
} from "../../src/domain/repositories/organization.repository.js";
import { CreateOrganizationUseCase } from "../../src/application/use-cases/create-organization.use-case.js";

describe("CreateOrganizationUseCase", () => {
  let repository: OrganizationRepository;
  let useCase: CreateOrganizationUseCase;

  beforeEach(() => {
    repository = {
      create: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
    };

    useCase = new CreateOrganizationUseCase(repository);
  });

  it("creates an organization with valid input", async () => {
    const input: CreateOrganizationInput = {
      name: "Acme Support",
      slug: "acme-support",
    };

    const expectedOrganization = new Organization({
      id: "org-123",
      name: "Acme Support",
      slug: "acme-support",
      status: "ACTIVE" satisfies OrganizationStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(repository.findBySlug).mockResolvedValue(null);
    vi.mocked(repository.create).mockResolvedValue(expectedOrganization);

    const result = await useCase.execute(input);

    expect(repository.findBySlug).toHaveBeenCalledWith("acme-support");
    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(expectedOrganization);
  });

  it("normalizes the slug to lowercase", async () => {
    const input = {
      name: "Acme Support",
      slug: "ACME-SUPPORT",
    };

    const expectedOrganization = new Organization({
      id: "org-123",
      name: "Acme Support",
      slug: "acme-support",
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(repository.findBySlug).mockResolvedValue(null);
    vi.mocked(repository.create).mockResolvedValue(expectedOrganization);

    await useCase.execute(input);

    expect(repository.findBySlug).toHaveBeenCalledWith("acme-support");
    expect(repository.create).toHaveBeenCalledWith({
      name: "Acme Support",
      slug: "acme-support",
    });
  });

  it("rejects invalid input", async () => {
    await expect(
      useCase.execute({
        name: "",
        slug: "invalid slug!",
      }),
    ).rejects.toThrow();

    expect(repository.findBySlug).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("rejects an already-used slug", async () => {
    const existingOrganization = new Organization({
      id: "org-existing",
      name: "Existing Organization",
      slug: "acme-support",
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(repository.findBySlug).mockResolvedValue(
      existingOrganization,
    );

    await expect(
      useCase.execute({
        name: "Another Organization",
        slug: "acme-support",
      }),
    ).rejects.toMatchObject({
      message: "An organization with this slug already exists",
      statusCode: 409,
    } satisfies Partial<AppError>);

    expect(repository.create).not.toHaveBeenCalled();
  });
});
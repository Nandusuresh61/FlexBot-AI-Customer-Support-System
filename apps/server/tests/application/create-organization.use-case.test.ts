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
import type {
  MembershipRepository,
} from "../../src/domain/repositories/membership.repository.js";
import { CreateOrganizationUseCase } from "../../src/application/use-cases/create-organization.use-case.js";

describe("CreateOrganizationUseCase", () => {
  let organizationRepository: OrganizationRepository;
  let membershipRepository: MembershipRepository;
  let useCase: CreateOrganizationUseCase;

  const creatorUserId = "user-123";

  beforeEach(() => {
    organizationRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
    };

    membershipRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUserAndOrganization: vi.fn(),
      findAllByOrganization: vi.fn(),
    };

    useCase = new CreateOrganizationUseCase(
      organizationRepository,
      membershipRepository,
    );
  });

  it("creates an organization and assigns the creator as ORG_ADMIN", async () => {
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

    vi.mocked(organizationRepository.findBySlug).mockResolvedValue(null);
    vi.mocked(organizationRepository.create).mockResolvedValue(
      expectedOrganization,
    );
    vi.mocked(membershipRepository.create).mockResolvedValue(
      {
        id: "membership-123",
        userId: creatorUserId,
        organizationId: expectedOrganization.id,
        role: "ORG_ADMIN",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Awaited<ReturnType<MembershipRepository["create"]>>,
    );

    const result = await useCase.execute(input, creatorUserId);

    expect(organizationRepository.findBySlug).toHaveBeenCalledWith(
      "acme-support",
    );

    expect(organizationRepository.create).toHaveBeenCalledWith(input);

    expect(membershipRepository.create).toHaveBeenCalledWith({
      userId: creatorUserId,
      organizationId: expectedOrganization.id,
      role: "ORG_ADMIN",
    });

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

    vi.mocked(organizationRepository.findBySlug).mockResolvedValue(null);
    vi.mocked(organizationRepository.create).mockResolvedValue(
      expectedOrganization,
    );
    vi.mocked(membershipRepository.create).mockResolvedValue(
      {
        id: "membership-123",
        userId: creatorUserId,
        organizationId: expectedOrganization.id,
        role: "ORG_ADMIN",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Awaited<ReturnType<MembershipRepository["create"]>>,
    );

    await useCase.execute(input, creatorUserId);

    expect(organizationRepository.findBySlug).toHaveBeenCalledWith(
      "acme-support",
    );

    expect(organizationRepository.create).toHaveBeenCalledWith({
      name: "Acme Support",
      slug: "acme-support",
    });
  });

  it("rejects invalid input", async () => {
    await expect(
      useCase.execute(
        {
          name: "",
          slug: "invalid slug!",
        },
        creatorUserId,
      ),
    ).rejects.toThrow();

    expect(organizationRepository.findBySlug).not.toHaveBeenCalled();
    expect(organizationRepository.create).not.toHaveBeenCalled();
    expect(membershipRepository.create).not.toHaveBeenCalled();
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

    vi.mocked(organizationRepository.findBySlug).mockResolvedValue(
      existingOrganization,
    );

    await expect(
      useCase.execute(
        {
          name: "Another Organization",
          slug: "acme-support",
        },
        creatorUserId,
      ),
    ).rejects.toMatchObject({
      message: "An organization with this slug already exists",
      statusCode: 409,
    } satisfies Partial<AppError>);

    expect(organizationRepository.create).not.toHaveBeenCalled();
    expect(membershipRepository.create).not.toHaveBeenCalled();
  });

  it("rejects creation without an authenticated creator", async () => {
    await expect(
      useCase.execute(
        {
          name: "Acme Support",
          slug: "acme-support",
        },
        "",
      ),
    ).rejects.toMatchObject({
      message: "Authenticated user is required",
      statusCode: 401,
    });

    expect(organizationRepository.create).not.toHaveBeenCalled();
    expect(membershipRepository.create).not.toHaveBeenCalled();
  });
});
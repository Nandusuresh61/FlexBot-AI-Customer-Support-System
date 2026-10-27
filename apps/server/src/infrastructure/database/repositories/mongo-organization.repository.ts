import type {
  OrganizationRepository,
  CreateOrganizationInput,
} from "../../../domain/repositories/organization.repository.js";
import type { Organization } from "../../../domain/entities/organization.entity.js";
import { AppError } from "../../../domain/errors/app-error.js";
import { OrganizationModel } from "../models/organization.model.js";
import { toOrganizationEntity } from "../mappers/organization.mapper.js";
import { toObjectId } from "../mongodb-id.js";

export class MongoOrganizationRepository
  implements OrganizationRepository
{
  async create(
    input: CreateOrganizationInput,
  ): Promise<Organization> {
    try {
      const document = await OrganizationModel.create({
        name: input.name,
        slug: input.slug,
      });

      return toOrganizationEntity(document);
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        throw new AppError(
          "An organization with this slug already exists",
          409,
        );
      }

      throw error;
    }
  }

  async findById(id: string): Promise<Organization | null> {
    const objectId = toObjectId(id);
    const document = await OrganizationModel.findById(objectId);

    return document ? toOrganizationEntity(document) : null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const document = await OrganizationModel.findOne({
      slug: slug.trim().toLowerCase(),
    });

    return document ? toOrganizationEntity(document) : null;
  }
}
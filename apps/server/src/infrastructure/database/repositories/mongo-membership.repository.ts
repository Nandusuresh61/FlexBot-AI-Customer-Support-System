import type {
  MembershipRepository,
  CreateMembershipInput,
} from "../../../domain/repositories/membership.repository.js";
import type { Membership } from "../../../domain/entities/membership.entity.js";
import { AppError } from "../../../domain/errors/app-error.js";
import { MembershipModel } from "../models/membership.model.js";
import { toMembershipEntity } from "../mappers/membership.mapper.js";
import { toObjectId } from "../mongodb-id.js";

export class MongoMembershipRepository implements MembershipRepository {
  async create(input: CreateMembershipInput): Promise<Membership> {
    try {
      const document = await MembershipModel.create({
        userId: input.userId.trim(),
        organizationId: toObjectId(input.organizationId),
        role: input.role,
      });

      return toMembershipEntity(document);
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        throw new AppError(
          "This user already has a membership in this organization",
          409,
        );
      }

      throw error;
    }
  }

  async findById(id: string): Promise<Membership | null> {
    const objectId = toObjectId(id);
    const document = await MembershipModel.findById(objectId);

    return document ? toMembershipEntity(document) : null;
  }

  async findByUserAndOrganization(
    userId: string,
    organizationId: string,
  ): Promise<Membership | null> {
    const document = await MembershipModel.findOne({
      userId: userId.trim(),
      organizationId: toObjectId(organizationId),
    });

    return document ? toMembershipEntity(document) : null;
  }

  async findAllByOrganization(
    organizationId: string,
  ): Promise<Membership[]> {
    const documents = await MembershipModel.find({
      organizationId: toObjectId(organizationId),
    }).sort({ createdAt: 1 });

    return documents.map(toMembershipEntity);
  }
}
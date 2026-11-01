import type {
  ChatbotConfigRepository,
  CreateChatbotConfigInput,
  UpdateChatbotConfigInput,
} from "../../../domain/repositories/chatbot-config.repository.js";
import { ChatbotConfigModel } from "../models/chatbot-config.model.js";
import { toChatbotConfigEntity } from "../mappers/chatbot-config.mapper.js";
import { AppError } from "../../../domain/errors/app-error.js";

export class MongoChatbotConfigRepository implements ChatbotConfigRepository {
  async create(input: CreateChatbotConfigInput) {
    try {
      const document = await ChatbotConfigModel.create({
        ...input,
        status: input.status ?? "ACTIVE",
      });

      return toChatbotConfigEntity(document.toObject());
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        throw new AppError(
          "Chatbot configuration already exists for this organization",
          409,
        );
      }

      throw error;
    }
  }

  async findByOrganizationId(organizationId: string) {
    const document = await ChatbotConfigModel.findOne({
      organizationId,
    }).lean();

    if (!document) {
      return null;
    }

    return toChatbotConfigEntity(document);
  }

  async updateByOrganizationId(
    organizationId: string,
    input: UpdateChatbotConfigInput,
  ) {
    const document = await ChatbotConfigModel.findOneAndUpdate(
      { organizationId },
      { $set: input },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!document) {
      return null;
    }

    return toChatbotConfigEntity(document);
  }
}

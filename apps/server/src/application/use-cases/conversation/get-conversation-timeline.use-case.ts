import type { ConversationRepository } from "../../../domain/repositories/conversation.repository.js";
import { AppError } from "../../../domain/errors/app-error.js";
import { HttpStatusCode } from "../../../constants/httpStatusCode.js";
import { AppMessage } from "../../../constants/appMessage.js";

interface GetConversationTimelineInput {
  organizationId: string;
  from: string;
  to: string;
}

export class GetConversationTimelineUseCase {
  constructor(
    private readonly _conversationRepository: ConversationRepository,
  ) {}

  async execute(input: GetConversationTimelineInput) {
    const { organizationId, from, to } = input;

    if (!organizationId?.trim()) {
      throw new AppError(
        AppMessage.ORGANIZATION_ID_REQUIRED,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T23:59:59.999Z`);

    if (
      !from ||
      !to ||
      Number.isNaN(fromDate.getTime()) ||
      Number.isNaN(toDate.getTime()) ||
      fromDate > toDate
    ) {
      throw new AppError(
        "Invalid date range. Provide valid from and to dates, with from <= to.",
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const results =
      await this._conversationRepository.getTimelineByOrganization(
        organizationId,
        fromDate,
        toDate,
      );

    const countsByDate = new Map(
      results.map((item) => [item.date, item.count]),
    );

    const timeline = [];
    const cursor = new Date(fromDate);

    while (cursor <= toDate) {
      const date = cursor.toISOString().slice(0, 10);

      timeline.push({
        date,
        count: countsByDate.get(date) ?? 0,
      });

      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return timeline;
  }
}

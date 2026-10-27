import { Types } from "mongoose";
import { AppError } from "../../domain/errors/app-error.js";

export function toObjectId(id: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid resource ID", 400);
  }

  return new Types.ObjectId(id);
}
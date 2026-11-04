import multer from "multer";
import { AppError } from "../../domain/errors/app-error.js";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/index.js";

const allowedMimeTypes = ["application/pdf", "text/plain", "text/markdown"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new AppError(
          AppMessage.UNSUPPORTED_FILE_TYPE,
          HttpStatusCode.BAD_REQUEST,
        ),
      );
    }

    callback(null, true);
  },
});

export const uploadKnowledgeDocument = upload.single("file");

import { Router } from "express";
import { widgetController } from "../../composition/container.js";
import { publicApiKeyAuthMiddleware } from "../middlewares/public-api-key.middleware.js";

const router = Router();

router.use(publicApiKeyAuthMiddleware);

router.post("/conversations", widgetController.createConversation);
router.post(
  "/conversations/:conversationId/messages",
  widgetController.sendMessage,
);
router.get(
  "/conversations/:conversationId/messages",
  widgetController.getMessages,
);

export default router;

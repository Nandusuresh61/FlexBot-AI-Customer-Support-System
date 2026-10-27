import { Router } from "express";
import { authController } from "../../composition/container.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);

authRouter.post(
  "/logout-all",
  authMiddleware,
  authController.logoutAll,
);

authRouter.get(
  "/me",
  authMiddleware,
  authController.me,
);

export default authRouter;
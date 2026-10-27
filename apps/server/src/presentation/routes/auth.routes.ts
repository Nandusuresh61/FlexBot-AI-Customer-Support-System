import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.login);
authRouter.post("/refresh", AuthController.refresh);

authRouter.post("/logout", AuthController.logout);

authRouter.post(
  "/logout-all",
  authMiddleware,
  AuthController.logoutAll,
);

authRouter.get(
  "/me",
  authMiddleware,
  AuthController.me,
);
export default authRouter;
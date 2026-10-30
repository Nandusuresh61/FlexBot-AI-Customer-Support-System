import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { notFoundMiddleware } from "./presentation/middlewares/not-found.middleware.js";
import { errorMiddleware } from "./presentation/middlewares/error.middleware.js";
import organizationRouter from "./presentation/routes/organization.routes.js";
import authRouter from "./presentation/routes/auth.routes.js";
import { HttpStatusCode } from "./constants/httpStatusCode.js";
import { AppMessage } from "./constants/appMessage.js";
import { ResponseHandler } from "./presentation/utils/responseHandler.js";
import externalRoutes from "./presentation/routes/external.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/organizations", organizationRouter);
app.use("/api/v1/external", externalRoutes);

app.get("/api/v1/health", (_req, res) => {
  ResponseHandler.success(
    res,
    HttpStatusCode.OK,
    AppMessage.API_RUNNING,
    {
      timestamp: new Date().toISOString(),
    },
  );
});

// Handle requests to undefined routes
app.use(notFoundMiddleware);

// Handle errors from the application
app.use(errorMiddleware);

export default app;
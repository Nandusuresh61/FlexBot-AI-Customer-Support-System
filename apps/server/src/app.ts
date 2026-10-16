import express from "express";
import cors from "cors";
import helmet from "helmet";
import { notFoundMiddleware } from "./presentation/middlewares/not-found.middleware";
import { errorMiddleware } from "./presentation/middlewares/error.middleware";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

//Handle requests to undefined routes
app.use(notFoundMiddleware);
//Handle error from the application.
app.use(errorMiddleware);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "FlexBot API is running",
    timestamp: new Date().toISOString(),
  });
});

export default app;
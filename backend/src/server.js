import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import config from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import laundryRoutes from "./routes/laundryRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

const app = express();

app.disable("x-powered-by");

const isTestEnv = config.nodeEnv === "test";

const buildRateLimitMessage = () => ({
  message: "Too many requests. Please try again later.",
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv,
  message: buildRateLimitMessage(),
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv,
  message: buildRateLimitMessage(),
});

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (config.nodeEnv === "production") {
      return origin === config.frontendUrl
        ? callback(null, true)
        : callback(null, false);
    }

    const isLocalhostOrigin =
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) ||
      /^https:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

    return origin === config.frontendUrl || isLocalhostOrigin
      ? callback(null, true)
      : callback(null, false);
  },
};

// Global middlewares
app.use(cors(corsOptions));
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        connectSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);
app.use(
  morgan(
    config.nodeEnv === "production"
      ? "tiny"
      : ":method :url :status :response-time ms"
  )
);
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "PressGo Backend Running 🚀",
  });
});

// API routes
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/laundries", laundryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling middlewares must be after all routes
app.use(notFound);
app.use(errorHandler);

const currentFilePath = fileURLToPath(import.meta.url);
const isDirectRun = process.argv[1] === currentFilePath;

if (isDirectRun && !isTestEnv) {
  app.listen(config.port, "0.0.0.0", () => {
    console.log(`Server running on port ${config.port}`);
  });
}

export default app;

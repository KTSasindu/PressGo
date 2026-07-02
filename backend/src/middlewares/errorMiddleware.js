export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  if (process.env.NODE_ENV === "production") {
    console.error("Error:", {
      message: err.message,
      path: req.originalUrl,
      method: req.method,
      statusCode,
    });
  } else {
    console.error("Error:", {
      message: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
      statusCode,
    });
  }

  res.status(statusCode).json({
    message:
      statusCode >= 500 && process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Server error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

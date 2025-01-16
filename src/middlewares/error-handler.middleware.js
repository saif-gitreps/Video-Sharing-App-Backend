const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
   const statusCode = err.statusCode || 500;
   const message = err.message || "Internal Server Error";

   // Log error for debugging
   console.error(`[Error] ${req.method} ${req.url}:`, {
      statusCode,
      message,
      stack: err.stack,
      body: req.body,
      params: req.params,
      query: req.query,
   });

   switch (true) {
      // Mongoose validation error
      case err.name === "ValidationError":
         return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: Object.values(err.errors).map((e) => e.message),
         });

      // MongoDB duplicate key error
      case err.code === 11000:
         return res.status(409).json({
            success: false,
            message: "Duplicate Resource",
            error: err.keyValue,
         });

      // JWT errors
      case err.name === "JsonWebTokenError":
         return res.status(401).json({
            success: false,
            message: "Invalid token",
         });

      case err.name === "TokenExpiredError":
         return res.status(401).json({
            success: false,
            message: "Token expired",
         });

      case err instanceof ApiError:
         return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
         });

      default:
         const responseMessage =
            process.env.NODE_ENV === "production" ? "Internal Server Error" : message;

         return res.status(statusCode).json({
            success: false,
            message: responseMessage,
            ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
         });
   }
};

module.exports = errorHandler;

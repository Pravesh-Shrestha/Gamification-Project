// ============================================================
// academia.io - Environment Configuration
// ============================================================

export const ENV = {
  PORT: parseInt(process.env.PORT || "3001", 10),
  JWT_SECRET: process.env.JWT_SECRET || (() => {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET environment variable is required in production");
    }
    console.warn("⚠️  WARNING: Using default JWT secret in development. Set JWT_SECRET for production.");
    return "academia-io-dev-secret-change-in-production";
  })(),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  NODE_ENV: process.env.NODE_ENV || "development",
} as const;

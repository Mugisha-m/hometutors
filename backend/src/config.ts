import dotenv from "dotenv";

dotenv.config();

const requiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const config = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: requiredEnv("DATABASE_URL"),
  jwtSecret: requiredEnv("JWT_SECRET"),
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  admin: {
    phone: requiredEnv("ADMIN_PHONE"),
    password: requiredEnv("ADMIN_PASSWORD"),
    email: process.env.ADMIN_EMAIL
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash"
  }
};

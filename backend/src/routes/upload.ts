import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config";
import { authenticate } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils";

const router = Router();

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

// Returns a signed upload signature so the frontend can upload directly to Cloudinary
router.post("/sign", authenticate, (req, res) => {
  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    return sendError(res, "Cloudinary is not configured", 500);
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "hometutors/profiles";

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    config.cloudinary.apiSecret
  );

  return sendSuccess(res, {
    timestamp,
    signature,
    folder,
    cloudName: config.cloudinary.cloudName,
    apiKey: config.cloudinary.apiKey,
  });
});

export default router;

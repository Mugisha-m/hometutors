import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import { authenticate } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils";

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Returns a signed upload signature so the frontend can upload directly to Cloudinary
router.post("/sign", authenticate, (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = "hometutors/profiles";

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );

  return sendSuccess(res, {
    timestamp,
    signature,
    folder,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
});

export default router;

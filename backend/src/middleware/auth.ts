import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { sendError } from "../utils";

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Authorization header missing", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (typeof payload === "object" && payload !== null && "id" in payload && "role" in payload) {
      req.user = { id: String(payload.id), role: String(payload.role) };
      return next();
    }
    return sendError(res, "Invalid token payload", 401);
  } catch (error) {
    return sendError(res, "Invalid or expired token", 401);
  }
};

export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, "Unauthorized", 403);
    }
    return next();
  };
};

import { Request, Response } from "express";

export const sendSuccess = (res: Response, data: unknown) => {
  return res.json({ success: true, data });
};

export const sendError = (res: Response, message: string, status = 400) => {
  return res.status(status).json({ success: false, message });
};

export type AuthRequest = Request & { user?: any };

import { NextFunction, Request, Response } from "express";

// Middleware function to check JSON data size
export const checkJsonSize = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = Buffer.byteLength(JSON.stringify(req.body), "utf-8");
  const maxSize = 100 * 1024; // 100KB in bytes

  if (contentLength > maxSize) {
    return res
      .status(400)
      .json({ error: "JSON data size exceeds the limit of 100KB" });
  }

  next();
};

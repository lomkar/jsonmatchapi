import { NextFunction, Request, Response } from "express";

//OMKAR YOU HAVE TO CONNECT THE REDIS
let redis:any
async function rateLimiter({
  secondsWindow,
  allowedHits,
}: {
  secondsWindow: number;
  allowedHits: number;
}) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    const requests = await redis.incr(ip);

    let ttl;
    if (requests === 1) {
      await redis.expire(ip, secondsWindow);
      ttl = secondsWindow;
    } else {
      ttl = await redis.ttl(ip);
    }

    if (requests > allowedHits) {
      return res.status(503).json({
        response: "error",
        callsInMinute: requests,
        ttl: ttl,
      });
    } else {
      next();
    }
  };
}

export default rateLimiter;

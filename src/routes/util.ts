/**
 * Utilities for routes.
 * @packageDocumentation
 */

import { Request, Response, NextFunction } from "express";
import { SessionService } from "../services";

/**
 * Authentication middleware.
 *
 * @param req Request object.
 * @param res Response object.
 * @param next Next function.
 */
export async function auth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const sessionID: string = req.cookies.sessionID;
  const validSession = sessionID
    ? await SessionService.sessionExists(sessionID)
    : false;

  if (validSession) {
    res.cookie("sessionID", sessionID, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    await SessionService.updateSession(sessionID);
    next();
  } else {
    res.send("Permission denied");
  }
}

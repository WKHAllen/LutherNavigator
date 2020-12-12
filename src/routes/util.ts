/**
 * Utilities for routes.
 * @packageDocumentation
 */

import { Request, Response, NextFunction } from "express";
import { MetaService, UserService, SessionService } from "../services";
import { sessionAge } from "../services/util";

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
      maxAge: sessionAge,
      httpOnly: true,
    });
    await SessionService.updateSession(sessionID);
    next();
  } else {
    renderPage(
      req,
      res,
      "401",
      {
        title: "Permission denied",
        after: req.originalUrl,
      },
      401
    );
  }
}

/**
 * Admin authentication middleware.
 *
 * @param req Request object.
 * @param res Response object.
 * @param next Next function.
 */
export async function adminAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const sessionID: string = req.cookies.sessionID;
  const userID = await SessionService.getUserIDBySessionID(sessionID);
  const admin = userID ? await UserService.isAdmin(userID) : false;

  if (admin) {
    res.cookie("sessionID", sessionID, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    await SessionService.updateSession(sessionID);
    next();
  } else {
    renderPage(
      req,
      res,
      "401",
      {
        title: "Permission denied",
        after: req.originalUrl,
      },
      401
    );
  }
}

/**
 * Render a webpage.
 *
 * @param req Request object.
 * @param res Response object.
 * @param page View to be rendered.
 * @param options Options to be passed to the view.
 * @param status HTTP status code.
 */
export async function renderPage(
  req: Request,
  res: Response,
  page: string,
  options: any = {},
  status: number = 200
): Promise<void> {
  options.url = req.originalUrl;

  const version = await MetaService.get("Version");
  options.version = version;

  const sessionID = req.cookies.sessionID;

  if (!sessionID) {
    options.loggedIn = false;
  } else {
    const user = await SessionService.getUserBySessionID(sessionID);

    if (!user) {
      options.loggedIn = false;
    } else {
      options.loggedIn = true;
      options.userID = user.id;
      options.userFirstname = user.firstname;
      options.admin = user.admin;
    }
  }

  res.status(status).render(page, options);
}

/**
 * Get the session ID cookie.
 *
 * @param req Request object.
 * @returns The session ID.
 */
export function getSessionID(req: Request): void {
  return req.cookies.sessionID;
}

/**
 * Set the session ID cookie.
 *
 * @param res Response object.
 * @param sessionID A session ID.
 */
export function setSessionID(res: Response, sessionID: string): void {
  res.cookie("sessionID", sessionID, {
    maxAge: sessionAge,
    httpOnly: true,
  });
}

/**
 * Delete the session ID cookie.
 *
 * @param res Response object.
 */
export function deleteSessionID(res: Response): void {
  res.clearCookie("sessionID");
}

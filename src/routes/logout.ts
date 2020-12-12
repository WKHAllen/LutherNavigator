/**
 * Logout routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { getSessionID, deleteSessionID } from "./util";
import { SessionService } from "../services";

/**
 * The logout router.
 */
export const logoutRouter = Router();

// Logout event
logoutRouter.get("/", async (req, res) => {
  const sessionID = getSessionID(req);

  if (sessionID) {
    deleteSessionID(res);
    await SessionService.deleteSession(sessionID);
  }

  res.redirect("/login");
});

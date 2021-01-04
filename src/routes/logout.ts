/**
 * Logout routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { getSessionID, deleteSessionID } from "./util";
import wrapRoute from "../asyncCatch";
import { SessionService } from "../services";

/**
 * The logout router.
 */
export const logoutRouter = Router();

// Logout event
logoutRouter.get(
  "/",
  wrapRoute(async (req, res) => {
    const sessionID = getSessionID(req);

    if (sessionID) {
      deleteSessionID(res);
      await SessionService.deleteSession(sessionID);
    }

    const after = req.query.after as string;

    if (after) {
      res.redirect(after);
    } else {
      res.redirect("/login");
    }
  })
);

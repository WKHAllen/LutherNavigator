/**
 * Logout routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { getDBM, getSessionID, deleteSessionID } from "./util";
import wrapRoute from "../asyncCatch";

/**
 * The logout router.
 */
export const logoutRouter = Router();

// Logout event
logoutRouter.get(
  "/",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);

    const sessionID = getSessionID(req);

    if (sessionID) {
      deleteSessionID(res);
      await dbm.sessionService.deleteSession(sessionID);
    }

    const after = req.query.after as string;

    if (after) {
      res.redirect(after);
    } else {
      res.redirect("/login");
    }
  })
);

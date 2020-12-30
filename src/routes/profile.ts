/**
 * Profile routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { renderPage, auth } from "./util";

/**
 * The profile router.
 */
export const profileRouter = Router();

// Profile page
profileRouter.get("/", auth, async (req, res) => {
  renderPage(req, res, "profile");
});

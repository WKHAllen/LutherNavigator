/**
 * Password reset routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { renderPage } from "./util";
import wrapRoute from "../asyncCatch";
import { PasswordResetService } from "../services";
import { sendEmail } from "../emailer";

/**
 * The password reset router.
 */
export const passwordResetRouter = Router();

// Request a password reset
passwordResetRouter.get(
  "/",
  wrapRoute(async (req, res) => {
    await renderPage(req, res, "passwordResetRequest");
  })
);

// Reset a password
passwordResetRouter.get(
  "/:resetID",
  wrapRoute(async (req, res) => {
    await renderPage(req, res, "passwordReset");
  })
);

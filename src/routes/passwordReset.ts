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

// Request password reset event
passwordResetRouter.post(
  "/",
  wrapRoute(async (req, res) => {
    res.redirect("/password-reset/success");
  })
);

// Request password reset success
passwordResetRouter.get(
  "/success",
  wrapRoute(async (req, res) => {
    await renderPage(req, res, "passwordResetSuccess");
  })
);

// Reset a password
passwordResetRouter.get(
  "/reset/:resetID",
  wrapRoute(async (req, res) => {
    await renderPage(req, res, "passwordReset");
  })
);

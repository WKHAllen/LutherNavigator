/**
 * Password reset routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { renderPage, getHostname } from "./util";
import wrapRoute from "../asyncCatch";
import { PasswordResetService } from "../services";
import { sendFormattedEmail } from "../emailer";

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
    const email = req.body.email;
    const resetID = await PasswordResetService.requestPasswordReset(email);

    if (resetID) {
      sendFormattedEmail(
        email,
        "Luther Navigator - Password Reset",
        "passwordReset",
        {
          host: getHostname(req),
          resetID,
        }
      );
    }

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

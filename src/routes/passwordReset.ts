/**
 * Password reset routes.
 * @packageDocumentation
 */

import { Router } from "express";
import {
  renderPage,
  getHostname,
  getErrorMessage,
  setErrorMessage,
} from "./util";
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
    const error = getErrorMessage(req, res);

    await renderPage(req, res, "passwordResetRequest", {
      error,
    });
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

    res.redirect("/password-reset/request-success");
  })
);

// Request password reset success
passwordResetRouter.get(
  "/request-success",
  wrapRoute(async (req, res) => {
    await renderPage(req, res, "passwordResetRequestSuccess");
  })
);

// Reset a password
passwordResetRouter.get(
  "/reset/:resetID",
  wrapRoute(async (req, res) => {
    const resetID = req.params.resetID;
    const exists = await PasswordResetService.resetRecordExists(resetID);
    const error = getErrorMessage(req, res);

    await renderPage(req, res, "passwordReset", {
      valid: exists,
      error,
    });
  })
);

// Reset password event
passwordResetRouter.post(
  "/reset/:resetID",
  wrapRoute(async (req, res) => {
    const resetID = req.params.resetID;
    const password = req.body.password;
    const password2 = req.body.confirmPassword;

    if (password.length < 8 || password.length > 255) {
      setErrorMessage(
        res,
        "Password must be between 8 and 255 characters in length"
      );
      res.redirect(`./${resetID}`);
    } else if (password !== password2) {
      setErrorMessage(res, "Passwords do not match");
      res.redirect(`./${resetID}`);
    } else {
      const success = await PasswordResetService.resetPassword(
        resetID,
        password
      );

      if (success) {
        res.redirect("/password-reset/reset-success");
      } else {
        setErrorMessage(res, "Your link has expired. Please try again.");
        res.redirect("/password-reset");
      }
    }
  })
);

// Password reset success
passwordResetRouter.get(
  "/reset-success",
  wrapRoute(async (req, res) => {
    await renderPage(req, res, "passwordResetSuccess");
  })
);

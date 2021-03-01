/**
 * Password reset routes.
 * @packageDocumentation
 */

import { Router } from "express";
import {
  renderPage,
  getDBM,
  getHostname,
  getErrorMessage,
  setErrorMessage,
} from "./util";
import wrapRoute from "../asyncCatch";
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
    const dbm = getDBM(req);

    const email = req.body.email;
    const resetID = await dbm.passwordResetService.requestPasswordReset(email);

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
    const dbm = getDBM(req);

    const resetID = req.params.resetID;
    const exists = await dbm.passwordResetService.resetRecordExists(resetID);
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
    const dbm = getDBM(req);

    const resetID = req.params.resetID;
    const newPassword: string = req.body.newPassword;
    const confirmNewPassword: string = req.body.confirmNewPassword;

    if (newPassword !== confirmNewPassword) {
      setErrorMessage(res, "Passwords do not match");
      res.redirect(`/password-reset/reset/${resetID}`);
    } else if (newPassword.length < 8) {
      setErrorMessage(res, "New password must be at least 8 characters");
      res.redirect(`/password-reset/reset/${resetID}`);
    } else {
      const success = await dbm.passwordResetService.resetPassword(
        resetID,
        newPassword
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

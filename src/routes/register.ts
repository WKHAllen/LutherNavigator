/**
 * Register routes.
 * @packageDocumentation
 */

import { Router } from "express";
import {
  renderPage,
  getErrorMessage,
  setErrorMessage,
  getHostname,
} from "./util";
import wrapRoute from "../asyncCatch";
import { UserService, UserStatusService, VerifyService } from "../services";
import { sendFormattedEmail } from "../emailer";

/**
 * The register router.
 */
export const registerRouter = Router();

// Register page
registerRouter.get(
  "/",
  wrapRoute(async (req, res) => {
    const error = getErrorMessage(req, res);
    const userStatuses = await UserStatusService.getStatuses();

    await renderPage(req, res, "register", {
      error,
      userStatuses,
    });
  })
);

// Register event
registerRouter.post(
  "/",
  wrapRoute(async (req, res) => {
    const firstname: string = req.body.firstname;
    const lastname: string = req.body.lastname;
    const email: string = req.body.email;
    const password: string = req.body.password;
    const confirmPassword: string = req.body.confirmPassword;
    const userStatus: number = parseInt(req.body.userStatus) || 0;

    // Validation
    if (firstname.length < 1 || firstname.length > 63) {
      setErrorMessage(res, "First name must be less than 64 characters");
      res.redirect("/register");
      return;
    }

    if (lastname.length < 1 || lastname.length > 63) {
      setErrorMessage(res, "Last name must be less than 64 characters");
      res.redirect("/register");
      return;
    }

    if (email.length < 5 || email.length > 63) {
      setErrorMessage(res, "Email must be less than 64 characters");
      res.redirect("/register");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(res, "Passwords do not match");
      res.redirect("/register");
      return;
    } else if (password.length < 8) {
      setErrorMessage(res, "Password must be at least 8 characters");
      res.redirect("/register");
      return;
    }

    const emailUnique = await UserService.uniqueEmail(email);
    if (!emailUnique) {
      setErrorMessage(res, "Email address is already in use");
      res.redirect("/register");
      return;
    }

    const validUserStatus = await UserStatusService.validStatus(userStatus);
    if (!validUserStatus) {
      setErrorMessage(res, "Invalid user status");
      res.redirect("/register");
      return;
    }

    // Verification
    const verifyID = await VerifyService.createVerifyRecord(email);

    if (verifyID) {
      const userID = await UserService.createUser(
        firstname,
        lastname,
        email,
        password,
        userStatus
      );

      sendFormattedEmail(
        email,
        "Luther Navigator - Verify Email",
        "verification",
        {
          host: getHostname(req),
          verifyID,
        }
      );
    }

    res.redirect("/register/register-success");
  })
);

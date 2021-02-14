/**
 * Profile routes.
 * @packageDocumentation
 */

import { Router } from "express";
import {
  renderPage,
  auth,
  upload,
  getDBM,
  getUserID,
  maxImageSize,
  setErrorMessage,
  getErrorMessage,
  getSessionID,
} from "./util";
import wrapRoute from "../asyncCatch";
import { checkPassword } from "../services/util";

/**
 * The profile router.
 */
export const profileRouter = Router();

// Profile page
profileRouter.get(
  "/",
  auth,
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);

    const userID = await getUserID(req);
    const user = await dbm.userService.getUser(userID);
    const posts = await dbm.postService.getUserPosts(userID);

    await renderPage(req, res, "profile", {
      title: "Your profile",
      error: getErrorMessage(req, res),
      userID: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      joinTime: user.joinTime,
      numPosts: `${posts.length} ${posts.length === 1 ? "post" : "posts"}`,
      hasPosts: posts.length > 0,
      posts,
    });
  })
);

// Set image event
profileRouter.post(
  "/setImage",
  auth,
  upload.single("image"),
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);

    if (!["image/png", "image/jpg", "image/jpeg"].includes(req.file.mimetype)) {
      setErrorMessage(res, "Profile image must be in PNG, JPG, or JPEG format");
    } else if (req.file.size >= maxImageSize) {
      setErrorMessage(
        res,
        `Profile image must be less than ${Math.floor(maxImageSize / 1024)} KB`
      );
    } else {
      const userID = await getUserID(req);
      const imageData = req.file.buffer;
      await dbm.userService.setUserImage(userID, imageData);
    }

    res.redirect("/profile");
  })
);

// Change password event
profileRouter.post(
  "/changePassword",
  auth,
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);

    const currentPassword: string = req.body.currentPassword;
    const newPassword: string = req.body.newPassword;
    const confirmNewPassword: string = req.body.confirmNewPassword;

    if (newPassword !== confirmNewPassword) {
      setErrorMessage(res, "Passwords do not match");
    } else if (newPassword.length < 8) {
      setErrorMessage(res, "New password must be at least 8 characters");
    } else {
      const sessionID = getSessionID(req);
      const user = await dbm.sessionService.getUserBySessionID(sessionID);
      const match = await checkPassword(currentPassword, user.password);

      if (!match) {
        setErrorMessage(res, "Incorrect password");
      } else {
        await dbm.userService.setUserPassword(user.id, newPassword);
      }
    }

    res.redirect("/profile");
  })
);

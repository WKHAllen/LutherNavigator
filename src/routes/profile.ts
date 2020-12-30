/**
 * Profile routes.
 * @packageDocumentation
 */

import { Router } from "express";
import * as fs from "fs";
import {
  renderPage,
  auth,
  upload,
  getUserID,
  maxImageSize,
  setErrorMessage,
  getErrorMessage,
  getSessionID,
} from "./util";
import { UserService, PostService, SessionService } from "../services";
import { checkPassword } from "../services/util";

/**
 * The profile router.
 */
export const profileRouter = Router();

// Profile page
profileRouter.get("/", auth, async (req, res) => {
  const userID = await getUserID(req);
  const user = await UserService.getUser(userID);
  const posts = await PostService.getUserPosts(userID);

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
});

// Set image event
profileRouter.post(
  "/setImage",
  auth,
  upload.single("image"),
  async (req, res) => {
    if (
      !["image/png", "image/jpg", "image/jpeg"].includes(req.file.mimetype)
    ) {
      setErrorMessage(
        res,
        "Profile image must be in PNG, JPG, or JPEG format"
      );
    } else if (req.file.size >= maxImageSize) {
      setErrorMessage(
        res,
        `Profile image must be less than ${Math.floor(maxImageSize / 1024)} KB`
      );
    } else {
      const userID = await getUserID(req);
      const imageData = await fs.promises.readFile(req.file.path);
      await UserService.setUserImage(userID, imageData);
    }

    await fs.promises.unlink(req.file.path);
    res.redirect("/profile");
  }
);

profileRouter.post("/changePassword", auth, async (req, res) => {
  const currentPassword: string = req.body.currentPassword;
  const newPassword: string = req.body.newPassword;
  const confirmNewPassword: string = req.body.confirmNewPassword;

  if (newPassword !== confirmNewPassword) {
    setErrorMessage(res, "Passwords do not match");
  } else if (newPassword.length < 8) {
    setErrorMessage(res, "New password must be at least 8 characters");
  } else {
    const sessionID = getSessionID(req);
    const user = await SessionService.getUserBySessionID(sessionID);
    const match = await checkPassword(currentPassword, user.password);

    if (!match) {
      setErrorMessage(res, "Incorrect password");
    } else {
      await UserService.setUserPassword(user.id, newPassword);
    }
  }

  res.redirect("/profile");
});

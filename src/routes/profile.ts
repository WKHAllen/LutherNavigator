/**
 * Profile routes.
 * @packageDocumentation
 */

import { Router } from "express";
import * as fs from 'fs';
import { renderPage, auth, upload, getUserID, maxImageSize } from "./util";
import { UserService, PostService } from "../services";

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
    error: req.cookies.errorMessage || null,
    userID: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    joinTime: user.joinTime,
    numPosts: `${posts.length} ${posts.length === 1 ? "post" : "posts"}`,
    hasPosts: posts.length > 0,
    posts,
  });

  req.cookies.errorMessage = undefined;
});

// Set image event
profileRouter.post(
  "/setImage",
  auth,
  upload.single("image"),
  async (req, res) => {
    if (!['image/png', 'image/jpg', 'image/jpeg'].includes(req.file.mimetype)) {
      res.cookie('errorMessage', 'Profile image must be in PNG, JPG, or JPEG format', {
        maxAge: 60 * 1000, // one minute
        httpOnly: true
      });
    } else if (req.file.size >= maxImageSize) {
      res.cookie('errorMessage', `Profile image must be less than ${Math.floor(maxImageSize / 1024)} KB`, {
        maxAge: 60 * 1000, // one minute
        httpOnly: true
      });
    } else {
      const userID = await getUserID(req);
      const imageData = await fs.promises.readFile(req.file.path);
      await UserService.setUserImage(userID, imageData);
    }

    await fs.promises.unlink(req.file.path);
    res.redirect('/profile');
  }
);

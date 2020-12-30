/**
 * Profile routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { renderPage, auth, getUserID } from "./util";
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

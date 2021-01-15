/**
 * Post routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { auth, renderPage } from "./util";
import wrapRoute from "../asyncCatch";
import { PostService, UserStatusService } from "../services";

/**
 * The post router.
 */
export const postRouter = Router();

// Create post page
postRouter.get(
  "/",
  auth,
  wrapRoute(async (req, res) => {
    await renderPage(req, res, "createPost");
  })
);

// Create post event
postRouter.post(
  "/",
  auth,
  wrapRoute(async (req, res) => {
    // TODO: create post
  })
);

// Post page
postRouter.get(
  "/:postID",
  wrapRoute(async (req, res) => {
    const postID = req.params.postID;

    const post = await PostService.getPost(postID);
    const user = await PostService.getPostUser(postID);
    const userStatusName = await UserStatusService.getStatusName(
      user.statusID
    );
    const images = await PostService.getPostImages(postID);

    await renderPage(req, res, "post", {
      title: post.location,
      postID,
      location: post.location,
      firstname: user.firstname,
      lastname: user.lastname,
      status: userStatusName,
      program: post.program,
      createTime: post.createTime,
      threeWords: post.threeWords,
      content: post.content,
      images,
    });
  })
);

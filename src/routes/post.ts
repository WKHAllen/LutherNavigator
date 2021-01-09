/**
 * Post routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { renderPage } from "./util";
import wrapRoute from "../asyncCatch";
import { PostService, UserStatusService } from "../services";

/**
 * The post router.
 */
export const postRouter = Router();

// Post page
postRouter.get(
  "/:postID",
  wrapRoute(async (req, res) => {
    const post = await PostService.getPost(req.params.postID);
    const user = await PostService.getPostUser(req.params.postID);
    const userStatusName = await UserStatusService.getStatusName(
      user.statusID
    );

    await renderPage(req, res, "post", {
      postID: post.id,
      location: post.location,
      firstname: user.firstname,
      lastname: user.lastname,
      status: userStatusName,
      program: post.program,
      createTime: post.createTime,
      threeWords: post.threeWords,
      content: post.content,
    });
  })
);

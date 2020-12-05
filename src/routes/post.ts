import { Router } from "express";
import { PostService, UserStatusService } from '../services';

export const postRouter = Router();

// Post page
postRouter.get("/:postID", async (req, res) => {
  const post = await PostService.getPost(req.params.postID);
  const user = await PostService.getPostUser(req.params.postID);
  const userStatusName = await UserStatusService.getStatusName(user.statusID);

  res.render("post", {
    location: post.location,
    firstname: user.firstname,
    lastname: user.lastname,
    status: userStatusName,
    program: post.program,
    createTime: post.createTime,
    threeWords: post.threeWords,
    content: post.content
  });
});

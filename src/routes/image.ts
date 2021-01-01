/**
 * Image routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { renderError } from "./util";
import wrapRoute from "../asyncCatch";
import { UserService, PostService } from "../services";
import proxy from "../proxy";

/**
 * The image router.
 */
export const imageRouter = Router();

// Get a user's image
imageRouter.get(
  "/user/:userID",
  wrapRoute(async (req, res, next) => {
    const userExists = await UserService.userExists(req.params.userID);

    if (userExists) {
      const image = await UserService.getUserImage(req.params.userID);

      if (image) {
        res.write(image.data, async (err) => {
          if (err) {
            await renderError(err, req, res);
          }
          res.end();
        });
      } else {
        const host = req.protocol + "://" + req.get("host");
        proxy(res, host + "/img/compass_b.png");
      }
    } else {
      next(); // 404
    }
  })
);

// Get a post's image
imageRouter.get(
  "/post/:postID",
  wrapRoute(async (req, res, next) => {
    const postExists = await PostService.postExists(req.params.postID);

    if (postExists) {
      const image = await PostService.getPostImage(req.params.postID);

      res.write(image.data, async (err) => {
        if (err) {
          await renderError(err, req, res);
        }
        res.end();
      });
    } else {
      next(); // 404
    }
  })
);

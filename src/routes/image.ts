/**
 * Image routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { renderError } from "./util";
import wrapRoute from "../asyncCatch";
import { UserService, PostService, ImageService } from "../services";
import proxy from "../proxy";

/**
 * The image router.
 */
export const imageRouter = Router();

// Get an image
imageRouter.get(
  "/id/:imageID",
  wrapRoute(async (req, res, next) => {
    const imageID = req.params.imageID;

    const image = await ImageService.getImage(imageID);

    if (image) {
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
  "/post/:postID/:id",
  wrapRoute(async (req, res, next) => {
    const postID = req.params.postID;
    const id = parseInt(req.params.id);

    const postExists = await PostService.postExists(postID);

    if (postExists) {
      const images = await PostService.getPostImages(postID);
      const image = images[id]?.data;

      if (image) {
        res.write(image, async (err) => {
          if (err) {
            await renderError(err, req, res);
          }
          res.end();
        });
      } else {
        next(); // 404
      }
    } else {
      next(); // 404
    }
  })
);

/**
 * Image routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { renderError } from "./util";
import { UserService } from "../services";
import proxy from "../proxy";

/**
 * The image router.
 */
export const imageRouter = Router();

// Get a user's image
imageRouter.get("/user/:userID", async (req, res, next) => {
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
});

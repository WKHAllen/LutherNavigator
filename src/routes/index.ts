/**
 * Index routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { auth } from "./util";

/**
 * The index router.
 */
export const indexRouter = Router();

// Index page
indexRouter.get("/", auth, async (req, res) => {
  const message = "Hello, world!";
  res.render("index", { message });
});

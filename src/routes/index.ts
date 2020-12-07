/**
 * Index routes.
 * @packageDocumentation
 */

import { Router } from "express";

/**
 * The index router.
 */
export const indexRouter = Router();

// Index page
indexRouter.get("/", async (req, res) => {
  const message = "Hello, world!";
  res.render("index", { message });
});

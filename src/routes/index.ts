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
indexRouter.get("/", async (req, res) => {
  const message = "Hello, world!";
  res.render("index", { message });
});

// Authentication test page
indexRouter.get("/auth", auth, async (req, res) => {
  res.send("Success!");
});

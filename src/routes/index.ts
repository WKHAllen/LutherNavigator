/**
 * Index routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { renderPage } from "./util";

/**
 * The index router.
 */
export const indexRouter = Router();

// Index page
indexRouter.get("/", async (req, res) => {
  const message = "Hello, world!";
  renderPage(req, res, "index", { message });
});

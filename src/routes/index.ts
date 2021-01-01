/**
 * Index routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { renderPage } from "./util";
import wrapRoute from "../asyncCatch";

/**
 * The index router.
 */
export const indexRouter = Router();

// Index page
indexRouter.get(
  "/",
  wrapRoute(async (req, res) => {
    await renderPage(req, res, "index");
  })
);

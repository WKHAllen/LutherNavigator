/**
 * Query routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { renderPage } from "./util";
import wrapRoute from "../asyncCatch";

/**
 * The query router.
 */
export const queryRouter = Router();

// Index page
queryRouter.get(
  "/",
  wrapRoute(async (req, res) => {
    await renderPage(req, res, "query");
  })
);

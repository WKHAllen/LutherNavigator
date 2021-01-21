/**
 * Index routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { renderPage } from "./util";
import wrapRoute from "../asyncCatch";
import { MetaService } from "../services";

/**
 * The index router.
 */
export const indexRouter = Router();

// Index page
indexRouter.get(
  "/",
  wrapRoute(async (req, res) => {
    const googleAnalyticsID = await MetaService.get("Google Analytics ID");

    await renderPage(req, res, "index", {
      googleAnalyticsID,
    });
  })
);

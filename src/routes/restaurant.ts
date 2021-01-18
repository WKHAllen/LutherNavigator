/**
 * Restaurant routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { renderPage } from "./util";
import wrapRoute from "../asyncCatch";

/**
 * The restaurant router.
 */
export const restaurantRouter = Router();

// Index page
restaurantRouter.get(
  "/",
  wrapRoute(async (req, res) => {
    await renderPage(req, res, "restaurant");
  })
);

/**
 * Register routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { renderPage } from "./util";
import wrapRoute from "../asyncCatch";

/**
 * The register router.
 */
export const registerRouter = Router();

// Register page
registerRouter.get(
  "/",
  wrapRoute(async (req, res) => {
    await renderPage(req, res, "register");
  })
);

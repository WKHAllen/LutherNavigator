/**
 * Registration routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { renderPage } from "./util";
import wrapRoute from "../asyncCatch";

/**
 * The registration router.
 */
export const registrationRouter = Router();

// Registration page
registrationRouter.get(
  "/",
  wrapRoute(async (req, res) => {
    await renderPage(req, res, "registration");
  })
);

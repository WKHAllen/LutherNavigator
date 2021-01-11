/**
 * Register routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { renderPage } from "./util";
import wrapRoute from "../asyncCatch";
import { UserStatusService } from "../services";

/**
 * The register router.
 */
export const registerRouter = Router();

// Register page
registerRouter.get(
  "/",
  wrapRoute(async (req, res) => {
    const userStatuses = await UserStatusService.getStatuses();

    await renderPage(req, res, "register", {
      userStatuses,
    });
  })
);

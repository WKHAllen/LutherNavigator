/**
 * API routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { adminAuth } from "./util";
import wrapRoute from "../asyncCatch";

/**
 * The API router.
 */
export const apiRouter = Router();

// Admin stats
apiRouter.get(
  "/adminStats",
  adminAuth,
  wrapRoute(async (req, res) => {
    res.json({});
  })
);

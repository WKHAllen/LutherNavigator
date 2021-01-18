/**
 * API routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { adminAuth } from "./util";
import wrapRoute from "../asyncCatch";
import { AdminService } from "../services";

/**
 * The API router.
 */
export const apiRouter = Router();

// Admin stats
apiRouter.get(
  "/adminStats",
  adminAuth,
  wrapRoute(async (req, res) => {
    const numUsers = await AdminService.getRecords("User");
    const numPosts = await AdminService.getRecords("Post");

    res.json({
      numUsers,
      numPosts,
    });
  })
);

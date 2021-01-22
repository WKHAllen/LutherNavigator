/**
 * API routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { adminAuth } from "./util";
import wrapRoute from "../asyncCatch";
import { AdminService, MetaService } from "../services";
import { metaConfig } from "../config";

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
    const numLoggedIn = await AdminService.getRecords("Session");

    res.json({
      Users: numUsers,
      Posts: numPosts,
      Sessions: numLoggedIn,
    });
  })
);

// Admin variables
apiRouter.get(
  "/adminVariables",
  adminAuth,
  wrapRoute(async (req, res) => {
    const variables = await MetaService.getAll();

    res.json(variables);
  })
);

// Set variable
apiRouter.get(
  "/setVariable",
  adminAuth,
  wrapRoute(async (req, res) => {
    const name = req.query.name as string;
    const value = req.query.value as string;
    const exists = await MetaService.exists(name);

    if (exists) {
      await MetaService.set(name, value);
    }

    res.end();
  })
);

// Reset variable
apiRouter.get(
  "/resetVariable",
  adminAuth,
  wrapRoute(async (req, res) => {
    const name = req.query.name as string;

    if (name in metaConfig) {
      await MetaService.set(name, metaConfig[name]);
    }

    res.send(String(metaConfig[name])).end();
  })
);

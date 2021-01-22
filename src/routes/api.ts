/**
 * API routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { adminAuth } from "./util";
import wrapRoute from "../asyncCatch";
import { AdminService, MetaService, UserService } from "../services";
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

// Get unapproved users
apiRouter.get(
  "/unapprovedUsers",
  adminAuth,
  wrapRoute(async (req, res) => {
    const unapproved = await UserService.getUnapproved();

    res.json(unapproved);
  })
);

// Approve registration
apiRouter.get(
  "/approveRegistration",
  adminAuth,
  wrapRoute(async (req, res) => {
    const userID = req.query.userID as string;
    const approved = req.query.approved as string;

    if (approved === undefined || approved === "true") {
      await UserService.setApproved(userID);
    } else {
      const isApproved = await UserService.isApproved(userID);

      if (!isApproved) {
        await UserService.deleteUser(userID);
      }
    }

    res.end();
  })
);

/**
 * API routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { adminAuth, getHostname } from "./util";
import wrapRoute from "../asyncCatch";
import {
  AdminService,
  MetaService,
  UserService,
  PostService,
} from "../services";
import { metaConfig } from "../config";
import { sendFormattedEmail } from "../emailer";

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
    const approved =
      req.query.approved === undefined || req.query.approved === "true";

    const user = await UserService.getUser(userID);

    if (approved) {
      await UserService.setApproved(userID);
      await sendFormattedEmail(
        user.email,
        "Luther Navigator - Account Approved",
        "accountApproved",
        {
          host: getHostname(req),
        }
      );
    } else {
      const isApproved = await UserService.isApproved(userID);

      if (!isApproved) {
        await UserService.deleteUser(userID);
        await sendFormattedEmail(
          user.email,
          "Luther Navigator - Account Not Approved",
          "accountNotApproved",
          {
            host: getHostname(req),
          }
        );
      }
    }

    res.end();
  })
);

// Get unapproved posts
apiRouter.get(
  "/unapprovedPosts",
  adminAuth,
  wrapRoute(async (req, res) => {
    const unapproved = await PostService.getUnapproved();

    res.json(unapproved);
  })
);

// Approve a post
apiRouter.get(
  "/approvePost",
  adminAuth,
  wrapRoute(async (req, res) => {
    const postID = req.query.postID as string;
    const approved =
      req.query.approved === undefined || req.query.approved === "true";

    if (approved) {
      await PostService.setApproved(postID);
    } else {
      const isApproved = await PostService.isApproved(postID);

      if (!isApproved) {
        await PostService.deletePost(postID);
      }
    }

    res.end();
  })
);

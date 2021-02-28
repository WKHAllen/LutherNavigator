/**
 * API routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { adminAuth, getDBM, getHostname } from "./util";
import wrapRoute from "../asyncCatch";
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
    const dbm = getDBM(req);

    const numUsers = await dbm.adminService.getRecords("User");
    const numPosts = await dbm.adminService.getRecords("Post");
    const numLoggedIn = await dbm.adminService.getRecords("Session");

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
    const dbm = getDBM(req);

    const variables = await dbm.metaService.getAll();

    res.json(variables);
  })
);

// Set variable
apiRouter.get(
  "/setVariable",
  adminAuth,
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);

    const name = req.query.name as string;
    const value = req.query.value as string;
    const exists = await dbm.metaService.exists(name);

    if (exists) {
      await dbm.metaService.set(name, value);
    }

    res.end();
  })
);

// Reset variable
apiRouter.get(
  "/resetVariable",
  adminAuth,
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);

    const name = req.query.name as string;

    if (name in metaConfig) {
      await dbm.metaService.set(name, metaConfig[name]);
    }

    res.send(String(metaConfig[name])).end();
  })
);

// Get unapproved users
apiRouter.get(
  "/unapprovedUsers",
  adminAuth,
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);

    const unapproved = await dbm.userService.getUnapproved();

    res.json(unapproved);
  })
);

// Approve registration
apiRouter.get(
  "/approveRegistration",
  adminAuth,
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);

    const userID = req.query.userID as string;
    const approved =
      req.query.approved === undefined || req.query.approved === "true";

    const user = await dbm.userService.getUser(userID);

    if (approved) {
      await dbm.userService.setApproved(userID);
      await sendFormattedEmail(
        user.email,
        "Luther Navigator - Account Approved",
        "accountApproved",
        {
          host: getHostname(req),
        }
      );
    } else {
      const isApproved = await dbm.userService.isApproved(userID);

      if (!isApproved) {
        await dbm.userService.deleteUser(userID);
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
    const dbm = getDBM(req);

    const unapproved = await dbm.postService.getUnapproved();

    res.json(unapproved);
  })
);

// Approve a post
apiRouter.get(
  "/approvePost",
  adminAuth,
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);

    const postID = req.query.postID as string;
    const approved =
      req.query.approved === undefined || req.query.approved === "true";

    const post = await dbm.postService.getPost(postID);
    const user = await dbm.postService.getPostUser(postID);

    if (approved) {
      await dbm.postService.setApproved(postID);
      await sendFormattedEmail(
        user.email,
        "Luther Navigator - Post Approved",
        "postApproved",
        {
          host: getHostname(req),
          postID,
          location: post.location,
        }
      );
    } else {
      const isApproved = await dbm.postService.isApproved(postID);

      if (!isApproved) {
        await dbm.postService.deletePost(postID);
        await sendFormattedEmail(
          user.email,
          "Luther Navigator - Post Not Approved",
          "postNotApproved",
          {
            host: getHostname(req),
            location: post.location,
          }
        );
      }
    }

    res.end();
  })
);

// Get list of programs
apiRouter.get(
  "/adminPrograms",
  adminAuth,
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);

    const programs = await dbm.programService.getPrograms();

    res.json(programs);
  })
);

// Create a new program
apiRouter.get(
  "/createProgram",
  adminAuth,
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);

    const programName = req.query.programName as string;

    const programID = await dbm.programService.createProgram(programName);

    res.send(programID);
  })
);

// Set a program
apiRouter.get(
  "/setProgram",
  adminAuth,
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);

    const programID = parseInt(req.query.programID as string);
    const programName = req.query.programName as string;

    const exists = await dbm.programService.programExists(programID);

    if (exists) {
      await dbm.programService.setProgramName(programID, programName);

      res.end();
    } else {
      res.send("A program with the specified ID does not exist");
    }
  })
);

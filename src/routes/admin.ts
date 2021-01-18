/**
 * Admin routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { adminAuth, renderPage } from "./util";
import wrapRoute from "../asyncCatch";

/**
 * The admin router.
 */
export const adminRouter = Router();

const adminPages = {
  stats: { page: "stats", name: "Stats" },
  registration: { page: "registration", name: "Registration" },
  posts: { page: "posts", name: "Posts" },
  variables: { page: "variables", name: "Variables" },
};

// Admin home page
adminRouter.get(
  "/",
  adminAuth,
  wrapRoute(async (req, res) => {
    const firstPage = Object.keys(adminPages)[0];
    res.redirect(`/admin/${firstPage}`);
  })
);

// All admin pages
adminRouter.get(
  "/:subpage",
  adminAuth,
  wrapRoute(async (req, res, next) => {
    const pageName = req.params.subpage;

    if (pageName in adminPages) {
      await renderPage(req, res, `admin-${pageName}`, {
        pages: adminPages,
        page: pageName,
        noBG: true,
      });
    } else {
      next(); // 404, invalid subpage
    }
  })
);

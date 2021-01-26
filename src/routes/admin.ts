/**
 * Admin routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { adminAuth, renderPage } from "./util";
import wrapRoute from "../asyncCatch";
import {} from "../services";

/**
 * The admin router.
 */
export const adminRouter = Router();

/**
 * Map of all admin page identifiers to their names.
 */
const adminPages = {
  stats: "Stats",
  variables: "Variables",
  registration: "Registration",
  posts: "Posts",
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
        title: "Admin Control Panel",
        pages: adminPages,
        page: pageName,
        noBG: true,
      });
    } else {
      next(); // 404, invalid subpage
    }
  })
);

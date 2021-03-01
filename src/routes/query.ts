/**
 * Query routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { renderPage, getDBM } from "./util";
import wrapRoute from "../asyncCatch";

/**
 * The query router.
 */
export const queryRouter = Router();

// Query page
queryRouter.get(
  "/",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);

    const locationTypes = await dbm.locationTypeService.getLocations();
    const programs = await dbm.programService.getPrograms();
    const userStatuses = await dbm.userStatusService.getStatuses();

    await renderPage(req, res, "query", {
      locationTypes,
      programs,
      userStatuses,
    });
  })
);

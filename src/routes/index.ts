/**
 * Index routes.
 * @packageDocumentation
 */

import { Router } from "express";
import * as services from "../services";

/**
 * The index router.
 */
export const indexRouter = Router();

// Index page
indexRouter.get("/", async (req, res) => {
  const message = await services.IndexServices.getMessage();
  res.render("index", { message });
});

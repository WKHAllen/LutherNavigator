/**
 * Handle exceptions thrown in async functions.
 * @packageDocumentation
 */

import { Request, Response, NextFunction } from "express";

/**
 * A route controller function.
 */
type Controller = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<void>;

/**
 * Wrap an asynchronous route controller in a try/catch block.
 *
 * @param route The route controller.
 * @returns The wrapped route controller.
 */
export default function wrapRoute(route: Controller): Controller {
  return async (req: Request, res: Response, next?: NextFunction) => {
    try {
      await route(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

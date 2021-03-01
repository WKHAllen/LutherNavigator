/**
 * Login routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { renderPage, getDBM, setSessionID } from "./util";
import wrapRoute from "../asyncCatch";

/**
 * The login router.
 */
export const loginRouter = Router();

// Login page
loginRouter.get(
  "/",
  wrapRoute(async (req, res) => {
    await renderPage(req, res, "login", { title: "Login", loginAfter: false });
  })
);

// Login event
loginRouter.post(
  "/",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);

    const email = req.body.email;
    const password = req.body.password;

    const validLogin = await dbm.userService.login(email, password);

    if (validLogin) {
      const user = await dbm.userService.getUserByEmail(email);
      const sessionID = await dbm.sessionService.createSession(user.id);
      await setSessionID(req, res, sessionID);

      const after = req.query.after as string;

      if (after) {
        res.redirect(after);
      } else {
        res.redirect("/");
      }
    } else {
      await renderPage(req, res, "login", {
        title: "Login",
        error: "Invalid login",
      });
    }
  })
);

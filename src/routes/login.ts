/**
 * Login routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { renderPage, setSessionID } from "./util";
import { UserService, SessionService } from "../services";

/**
 * The login router.
 */
export const loginRouter = Router();

// Login page
loginRouter.get("/", async (req, res) => {
  await renderPage(req, res, "login", { title: "Login" });
});

// Login event
loginRouter.post("/", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const validLogin = await UserService.login(email, password);

  if (validLogin) {
    const user = await UserService.getUserByEmail(email);
    const sessionID = await SessionService.createSession(user.id);
    setSessionID(res, sessionID);

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
});

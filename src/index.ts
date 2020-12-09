/**
 * Index file for the project.
 * @packageDocumentation
 */

import * as express from "express";
import * as hbs from "express-handlebars";
import * as enforce from "express-sslify";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as routes from "./routes";
import { renderPage } from "./routes/util";
import initDB from "./dbinit";

/**
 * Debug/production environment.
 */
const debug = !!parseInt(process.env.DEBUG);

/**
 * Port number to use.
 */
const port = parseInt(process.env.PORT);

/**
 * Express app.
 */
const app = express();

// Disable caching for authentication purposes
app.set("etag", false);
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

// Enforce HTTPS
if (!debug) {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

// Use view engine
app.engine(
  ".html",
  hbs({
    extname: ".html",
    defaultLayout: "default",
  })
);
app.set("view engine", ".html");

// Request body parsing
app.use(bodyParser.urlencoded({ extended: true }));

// Cookie parsing
app.use(cookieParser());

// Include static directory for css and js files
app.use(express.static("static"));

// Use routes
app.use("/", routes.indexRouter);
app.use("/post", routes.postRouter);

// Error 404 (not found)
app.use((req, res) => {
  renderPage(req, res, "404", { title: "Not found" }, 404);
});

// Error 500 (internal server error)
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const options = !debug
      ? {}
      : {
          name: err.name,
          message: err.message,
          stack: err.stack,
        };
    renderPage(
      req,
      res,
      "500",
      Object.assign(options, { title: "Internal server error" }),
      500
    );
    console.error(err.stack);
  }
);

// Initialize the database
initDB().then(() => {
  // Listen for connections
  app.listen(port, () => {
    console.log(`App running on port ${port}`);
  });
});

// Export the express app
export = app;

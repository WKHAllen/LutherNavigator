import * as express from "express";
import * as hbs from "express-handlebars";
import * as enforce from "express-sslify";
import * as bodyParser from "body-parser";
import * as routes from "./routes";
import initDB from "./dbinit";

// Environment variables
const debug = Boolean(Number(process.env.DEBUG));
const port = Number(process.env.PORT);

// Create express app
const app = express();

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

// Include static directory for css and js files
app.use(express.static("static"));

// Use routes
app.use("/", routes.indexRoute);

// Error 404 (not found)
app.use((req, res) => {
  res.status(404).render("404", { title: "Not found" });
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
    res
      .status(500)
      .render(
        "500",
        Object.assign(options, { title: "Internal server error" })
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

export = app;

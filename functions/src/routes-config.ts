import {Application} from "express";
import {isAuthenticated} from "./auth/authenticated";
import {addEntry, getAllEntries} from "./eventTemplateController";
import {isAuthorized} from "./auth/authorized";

/**
 * routes for express
 * @param app - express application
 */
export function routesConfig(app: Application) {
  app.get("/", (req, res) => res.status(200).send("Hey there!"));
  app.post("/eventtemplates", isAuthenticated,
    isAuthorized({hasRoles: ["planer"]}), addEntry);
  app.get("/eventtemplates", isAuthenticated,
    isAuthorized({hasRoles: ["planer"]}), getAllEntries);
}

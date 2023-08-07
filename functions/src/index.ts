import * as functions from "firebase-functions";
import * as express from "express";
import cors = require("cors");
import * as bodyParser from "body-parser";
import {routesConfig} from "./routes-config";

export const app = express();

app.use(bodyParser.json());
app.use(cors({origin: true}));
routesConfig(app);


exports.app = functions.https.onRequest(app);

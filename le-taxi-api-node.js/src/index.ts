// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import cors from "cors";
import "es6-shim";
import express from "express";
import fs from "fs";
import { types } from "pg";
import "reflect-metadata";
import { configs } from "./config/configs";
import { mapErrorToApiErrorResponse } from "./features/errorHandling/errorMapping";
import { UnauthorizedError } from "./features/errorHandling/errors";
import { internalServerErrorResponse } from "./features/errorHandling/internalServerErrorResponse";
import { logErrorLogEntry } from "./features/errorHandling/logErrorEntry";
import { initializeFakeApi } from "./features/fakeApi/initializeFakeApi";
import { initializeMetrics } from "./features/metrics/initializeMetrics";
import { asUtcIsoString } from "./features/shared/dateUtils/dateUtils";
import {
  defineStartServerWithErrorHandling,
  initializeExpressErrorHandlingModule_OnlyAfterAllRoutesHaveBeenDefined,
} from "./features/shared/expressErrorHandling/expressErrorHandling";
import { logger } from "./features/shared/logging/logger";
import { connectToMongoDb } from "./features/shared/taxiMongo/taxiMongo";
import { handleConstructorField } from "./features/shared/validations/validators";
import { initializeAuthorizationViaCookies } from "./features/users/securityDecorator";
import { getSigningKeyForJwtCreation } from "./libs/security";
import {
  httpMethodToExpressMethodName,
  IHandlerRoute,
} from "./models/route.model";
import { getAbsoluteUrl } from "./utils/configs/system";

declare let require: any;

const compression = require("compression");
const promBundle = require("express-prom-bundle");
const xss = require("xss");

const startServerWithErrorHandling =
  defineStartServerWithErrorHandling(startServer);

async function startServer() {
  const app = express();

  initializeMetrics(app);

  app.use(compression());

  const port: number = configs.api.port;
  const host: string = getAbsoluteUrl("");

  const corsOptions = {
    origin(origin, callback) {
      callback(null, true);
    },
    credentials: true,
  };

  app.use(cors(corsOptions));

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json({ limit: "100mb", reviver: handleConstructorField }));

  // xss security
  app.use(function (req, res, next) {
    //get
    for (const param in req.query) {
      /* eslint-disable @typescript-eslint/no-base-to-string */
      const securedParam: string = xss("" + req.query[param]);
      if ("" + req.query[param] !== "" + securedParam) {
        throw new UnauthorizedError("XSS protection");
      }
      /* eslint-enable @typescript-eslint/no-base-to-string */
    }

    // post, put
    for (const param in req.body?.data) {
      if (req.body.data[param] instanceof Object) {
        for (const propertyName in req.body.data[param]) {
          const securedParam: string = xss(
            "" + req.body.data[param][propertyName],
          );
          if ("" + req.body.data[param][propertyName] !== "" + securedParam) {
            throw new UnauthorizedError("XSS body protection");
          }
        }
      } else {
        const securedParam: string = xss("" + req.body.data[param]);
        if ("" + req.body.data[param] !== "" + securedParam) {
          throw new UnauthorizedError("XSS body protection");
        }
      }
    }
    next();
  });

  app.get("/:test", function (req, res, next) {
    if (req.params.test) {
      const securedParam: string = xss("" + req.params.test);
      if ("" + req.params.test !== "" + securedParam) {
        throw new UnauthorizedError("XSS body protection");
      }
    }
    next();
  });

  // init controllers
  fs.readdirSync("src/controllers").forEach((file) => {
    if (file.substr(-3) === ".js") {
      const controllerName: string = "./controllers/" + file;
      const module = require(controllerName);
      new module.controller(app);
    }
  });

  const featureRoutes = require("./features/routes");
  addRoutes(app, featureRoutes.getFeaturesRoutes());
  initializeFakeApi(app);

  initializeExpressErrorHandlingModule_OnlyAfterAllRoutesHaveBeenDefined(
    app,
    mapErrorToApiErrorResponse,
    internalServerErrorResponse,
    logErrorLogEntry,
    isDebuggingErrorsEnabled(),
    (request) => request?.userModel?.email,
  );

  initializeAuthorizationViaCookies(getSigningKeyForJwtCreation());

  const server = app.listen(port, () => {
    logger.info("Host " + host);
    logger.info("Listening on port " + port);
    logger.info("Server Started");
  });

  // Keep alive has to be greater than the 60s defined in ingress's nginx
  server.keepAliveTimeout = 65000;

  configurePgTimestampsAsUtcIsoString();

  await connectToMongoDb();

  configureCertificateValidationForTlsConnections();

  return app;
}

export function addRoutes(app: express.Express, apiRoutes: IHandlerRoute[]) {
  for (const route of apiRoutes) {
    const middlewares = route.middlewares || [];

    app[httpMethodToExpressMethodName(route.method)](
      route.path,
      middlewares,
      route.handler,
    );
  }
}

function configurePgTimestampsAsUtcIsoString() {
  types.setTypeParser(types.builtins.TIMESTAMP, (stringValue) => {
    return asUtcIsoString(stringValue);
  });
}

function isDebuggingErrorsEnabled(): boolean {
  return configs.environment.isLocalOrDev;
}

function configureCertificateValidationForTlsConnections(): void {
  if (configs.environment.isLocalOrDev) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }
}

// have test knows when we will be ready...
export const waitForAppToStart = startServerWithErrorHandling();

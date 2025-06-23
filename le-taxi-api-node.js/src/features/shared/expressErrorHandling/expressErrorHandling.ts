// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as express from "express";
import * as core from "express-serve-static-core";
import {
  getContextSensitiveErrorResponse,
  IApiErrorResponse,
  injectErrorToErrorResponseIfDebug,
  MapErrorToApiErrorResponseFn,
} from "./apiErrorResponse";
import {
  createHttpContextErrorLogEntry,
  createNonHttpContextErrorLogEntry,
  IErrorLogEntry,
  LogErrorFn,
  ResolveCurrentUserIdFromRequestFn,
} from "./errorLogEntry";

/**
 * Initializes the module. It's important to call this function after all routes have been defined in Express.
 * @param app
 * @param mapErrorToApiErrorResponse
 * @param internalServerError
 * @param logErrorAction
 * @param debug
 * @param resolveCurrentUserIdFromRequestFn (optional)
 */
export function initializeExpressErrorHandlingModule_OnlyAfterAllRoutesHaveBeenDefined<
  TDto
>(
  app: core.Express,
  mapErrorToApiErrorResponse: MapErrorToApiErrorResponseFn<TDto>,
  internalServerError: IApiErrorResponse<TDto>,
  logErrorAction: LogErrorFn,
  debug?: boolean,
  resolveCurrentUserIdFromRequestFn?: ResolveCurrentUserIdFromRequestFn
) {
  ensureExpressErrorHandlingModuleInitializedOnlyOnce();
  required("app", app);
  required("mapErrorToApiErrorResponse", mapErrorToApiErrorResponse);
  required("internalServerError", internalServerError);
  required("logErrorLogEntry", logErrorAction);
  required("debug", debug);

  registerUncaughtExceptionHandler(logErrorAction);
  registerUnhandledRejectionHandler(logErrorAction);

  app.use(handleErrorMiddleware);
  isModuleInitialized = true;

  function handleErrorMiddleware(
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void {
    const currentUserId = resolveCurrentUserIdFromRequestWithErrorHandling(
      resolveCurrentUserIdFromRequestFn,
      req
    );
    try {
      const safeApiErrorResponse = getSafeApiErrorResponse();
      logErrorAndWriteResponse(logErrorAction, safeApiErrorResponse, err);
    } catch (errorDuringErrorHanlding) {
      logErrorAndWriteResponse(
        logWithConsoleAsLastResort,
        internalServerError,
        errorDuringErrorHanlding
      );
    }

    function getSafeApiErrorResponse() {
      // If headers are sent, it is too late to send anything to the api client.
      if (res.headersSent) {
        return null;
      }
      const apiErrorResponse = mapErrorToApiErrorResponse(err);
      return getContextSensitiveErrorResponse(
        apiErrorResponse,
        internalServerError,
        debug
      );
    }

    function logErrorAndWriteResponse(
      logError: LogErrorFn,
      apiErrorResponse: IApiErrorResponse<TDto>,
      error: any,
      message?: string
    ) {
      const httpContextErrorLogEntry = createHttpContextErrorLogEntry(
        req.method,
        req.url,
        currentUserId,
        apiErrorResponse,
        err,
        message
      );
      logError(httpContextErrorLogEntry);
      if (apiErrorResponse) {
        res.setHeader("content-type", "application/json");
        res.status(apiErrorResponse.httpStatusCode);
        const dto = injectErrorToErrorResponseIfDebug(
          debug,
          error,
          apiErrorResponse
        );
        res.send(dto);
      }
    }
  }
}

function registerUnhandledRejectionHandler(logError: LogErrorFn) {
  process.on("unhandledRejection", (reason: any) => {
    const nonHttpContextErrorLogEntry = createNonHttpContextErrorLogEntry(
      "unhandledRejection. If a fire and forget function call was really intended, consider using defineFireAndForget for proper error handling.",
      reason
    );
    logError(nonHttpContextErrorLogEntry);
  });
}

/*
 * If you are thinking about modifying this function,
 * make sure you read :
 * https://nodejs.org/api/process.html#process_warning_using_uncaughtexception_correctly
 */
function registerUncaughtExceptionHandler(logErrorAction: LogErrorFn) {
  process.on("uncaughtException", (error: any) => {
    try {
      const nonHttpContextErrorLogEntry = createNonHttpContextErrorLogEntry(
        "A fatal error occured.",
        error
      );
      logErrorAction(nonHttpContextErrorLogEntry);
    } finally {
      process.exit(1);
    }
  });
}

function logWithConsoleAsLastResort(logEntry: IErrorLogEntry): void {
  const logEntryAsString = JSON.stringify(logEntry, null, 0);
  // eslint-disable-next-line no-console
  console.error(logEntryAsString);
}

function required(paramName: string, paramValue: any) {
  if (!paramValue && typeof paramValue !== "boolean") {
    throw new Error(`The parameter '${paramName}' is required.`);
  }
}

let isModuleInitialized = false;
function ensureExpressErrorHandlingModuleInitializedOnlyOnce() {
  if (isModuleInitialized) {
    throw new Error(
      "The Express Error Handling module must be initialized only once. Make sure that you're not calling the initialize method more than once."
    );
  }
}

export function defineFireAndForget(logErrorAction: LogErrorFn) {
  return (action: () => Promise<any>) => {
    action().catch((error) => {
      const errorLogEntry = createNonHttpContextErrorLogEntry(
        "An unexpected error occured in a fire and forget context",
        error
      );
      logErrorAction(errorLogEntry);
    });
  };
}

export function defineStartServerWithErrorHandling(
  startServer: () => Promise<any>
) {
  return async () => {
    try {
      return await startServer();
    } catch (err) {
      logStartupError(err);
      process.exit(-1);
    }
  };
}

function logStartupError(err: any): void {
  const logEntry = createNonHttpContextErrorLogEntry(
    "Error starting the application.",
    err
  );

  // cannot depends on logErrorAction for startup error
  // because the error may occured before or from logErrorAction initialization
  logWithConsoleAsLastResort(logEntry);
}

function resolveCurrentUserIdFromRequestWithErrorHandling(
  resolveCurrentUserIdFromRequestFn: ResolveCurrentUserIdFromRequestFn,
  req: express.Request
) {
  if (!resolveCurrentUserIdFromRequestFn) {
    return null;
  }
  try {
    return resolveCurrentUserIdFromRequestFn(req);
  } catch (err) {
    const logEntry = createNonHttpContextErrorLogEntry(
      "Error while resolving the current user id from the request.",
      err
    );

    logWithConsoleAsLastResort(logEntry);

    // Keep logging the orignal error without the user id
    return null;
  }
}

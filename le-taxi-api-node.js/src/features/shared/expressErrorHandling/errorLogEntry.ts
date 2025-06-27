// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as express from "express";
import { IApiErrorResponse, isServerFault } from "./apiErrorResponse";
const { serializeError } = require("serialize-error");

/**
 * Represents a basic error log entry.
 *
 */
export interface IErrorLogEntry {
  isServerFault: boolean;
  message: string;
  error: any;
  [index: string]: any;
}

/**
 * Extends the ErrorLogEntry to provide a richer context such as the HTTP method, the URL and the API error response of the error.
 */
export interface IHttpContextErrorLogEntry<TDto> extends IErrorLogEntry {
  httpMethod: string;
  url: string;
  currentUserId: string;
  apiErrorResponse: IApiErrorResponse<TDto>;
}

/**
 * Represents an action delegate that accepts an instance of ErrorLogEntry and returns void.
 */
export type LogErrorFn = (errorLogEntry: IErrorLogEntry) => void;

/**
 * Resolve the current user id from the http request.
 * In order to keep error handling as simple as possible, IO operations are not allowed during error handling.
 * If an IO operation is required to resolve the user id from the http request, perform the IO operation
 * previously in another middleware and attach the result to the http request.
 * Ex: if only an api key is present in the http request, you may want to lookup for the user name
 * in oder to avoid logging a secret (the api key) in case of error.
 */
export type ResolveCurrentUserIdFromRequestFn = (
  request: express.Request
) => string;

/**
 * Use this function to create an instance of ErrorLogEntry when we're not inside an HTTP context.
 *
 * @param message
 * @param error
 */
export function createNonHttpContextErrorLogEntry(
  message: string,
  error: any
): IErrorLogEntry {
  return {
    isServerFault: true,
    message,
    error: serializeError(error),
  };
}

/**
 * Use this function to create an instance of HttpContextErrorLogEntry when we're inside an HTTP context.
 *
 * @param httpMethod
 * @param url
 * @param apiErrorResponse
 * @param error
 * @param logMessage
 */
export function createHttpContextErrorLogEntry<TDto>(
  httpMethod: string,
  url: string,
  currentUserId: string,
  apiErrorResponse: IApiErrorResponse<TDto>,
  error: any,
  logMessage?: string
): IHttpContextErrorLogEntry<TDto> {
  return {
    httpMethod,
    url,
    currentUserId,
    apiErrorResponse,
    isServerFault: isServerFault(apiErrorResponse),
    message: logMessage ? logMessage : getErrorMessage(error),
    error: serializeError(error),
  };
}

function getErrorMessage(error: any): string {
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "The error is not an instance of Error.";
}

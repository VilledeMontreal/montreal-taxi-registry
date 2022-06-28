// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { NextFunction } from 'express';
import { Request, Response } from 'express';

/**
 * The http methods
 */
export enum HttpMethods {
  ALL, // All methods
  GET,
  POST,
  PUT,
  HEAD,
  DELETE,
  OPTIONS,
  TRACE,
  COPY,
  LOCK,
  MKCOL,
  MOVE,
  PURGE,
  PROPFIND,
  PROPPATCH,
  UNLOCK,
  REPORT,
  MKACTIVITY,
  CHECKOUT,
  MERGE,
  NOTIFY,
  SUBSCRIBE,
  UNSUBSCRIBE,
  PATCH,
  SEARCH,
  CONNECT
}

/**
 * Converts a http method to its string representation.
 */
export function httpMethodToString(method: HttpMethods): string {
  if (isNaN(method)) {
    return undefined;
  }
  return HttpMethods[method];
}

/**
 * Converts a http method to its associated Express method name
 */
export function httpMethodToExpressMethodName(method: HttpMethods): string {
  const name = httpMethodToString(method);
  return name ? name.toLowerCase() : name;
}

/**
 * The base informations of a route.
 */
export interface IRoute {
  /**
   * The HTTP method
   */
  method: HttpMethods;

  /**
   * The *relative* path of the route
   * Example : "/users/search"
   */
  path: string;
}

/**
 * The informations required to build a route, including
 * the handler specific to the route.
 */
export interface IHandlerRoute extends IRoute {
  /**
   * The handler function to manage requests to this route.
   */
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void> | void;
  /**
   * Middlewares that can be attached to the request pipeline.
   */
  middlewares?: ((req: Request, res: Response, next: NextFunction) => void)[];
}

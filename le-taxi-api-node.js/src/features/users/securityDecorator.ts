// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import assert from "assert";
import Cookies from "cookies";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { security } from "../../libs/security";
import { UnauthorizedError } from "../errorHandling/errors";
import { buildApiEndpoint } from "../shared/utils/apiUtils";
import { UserModel } from "./user.model";
import { userRepositoryWithCaching } from "./user.repositoryWithCaching";
import { UserRole } from "./userRole";

const njwt = require("njwt");

let _secretJwtKey = null;

export function initializeAuthorizationViaCookies(secretJwtKey: string) {
  assert.ok(
    secretJwtKey,
    "A secretJwtKey is required for allowing authorization via cookies.",
  );
  _secretJwtKey = secretJwtKey;
}

export function allow(allowedRoles: UserRole[] | string[]) {
  return (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;
    assert.ok(
      typeof originalMethod === "function",
      "The allow annotation can only be used on functions.",
    );
    assert.ok(
      allowedRoles && allowedRoles.length > 0,
      "At least one role must by allowed by the decorator @allow",
    );

    descriptor.value = async function (
      request: Request,
      response: Response,
      ...rest
    ) {
      const argumentsReceived = [request, response, ...rest];
      const apiKey = request.get("X-API-KEY");

      if (apiKey) {
        request.userModel = await authenticateUser(apiKey);
        return originalMethod.apply(this, argumentsReceived);
      }

      if (isAuthorizationViaCookiesEnabled()) {
        const accessToken = new Cookies(request, response).get("access_token");
        if (accessToken) {
          const jwt = njwt.verify(accessToken, _secretJwtKey);
          const key = security.decrypt(jwt.body.apikey);
          request.userModel = await authenticateUser(key);
          return originalMethod.apply(this, argumentsReceived);
        }

        if (isUiConventionForNotAuthenticatedUser(request)) {
          response.writeHead(StatusCodes.OK, {
            "Content-Type": "application/json",
          });
          response.end();
          return;
        }
      }

      throw new UnauthorizedError(
        "API key is missing or invalid. Specify a valid API key in X-API-KEY request header.",
      );
    };
  };

  async function authenticateUser(apiKey: string) {
    const user = await userRepositoryWithCaching.getByKey(apiKey);
    ensureUserExists(user);
    ensureUserIsActive(user);
    ensureUserIsAllowed(user);
    return user;
  }

  function ensureUserExists(user: UserModel) {
    if (!user) {
      throw new UnauthorizedError(
        "API key is missing or invalid. Specify a valid API key in X-API-KEY request header.",
      );
    }
  }

  function ensureUserIsActive(user: UserModel) {
    if (!user.active) {
      throw new UnauthorizedError("The user is currently not active.");
    }
  }

  function ensureUserIsAllowed(user: UserModel) {
    if (!isUserAllowed(user)) {
      throw new UnauthorizedError(
        "The user has a role which has insufficient permissions to access this resource.",
      );
    }
  }

  function isUserAllowed(user: UserModel) {
    if (!user) {
      return false;
    }
    return allowedRoles.some((allowedRole) => allowedRole === user.role_name);
  }

  function isAuthorizationViaCookiesEnabled() {
    return _secretJwtKey !== null;
  }

  function isUiConventionForNotAuthenticatedUser(request: any) {
    return (
      request.originalUrl === buildApiEndpoint("/api/legacy-web/login/userinfo")
    );
  }
}

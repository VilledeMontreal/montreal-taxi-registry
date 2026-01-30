// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { allow } from "../../users/securityDecorator";
import { UserRole } from "../../users/userRole";
import { gofsDeepLinksGenerator } from "./gofsDeepLinks.generator";
import {
  validateUserForDeepLinks,
  validateUserId,
} from "./gofsDeepLinks.validator";

class GofsDeepLinksController {
  @allow([UserRole.Admin, UserRole.Manager])
  public async getDeepLinksForId(request: Request, response: Response) {
    const user = await validateUserId(request);
    validateUserForDeepLinks(user);
    const template = gofsDeepLinksGenerator.generateDeepLinksPage(user);
    sendHtml(response, template);
  }

  @allow([UserRole.Operator])
  public async getDeepLinksForCurrentUser(
    request: Request,
    response: Response,
  ) {
    validateUserForDeepLinks(request.userModel);
    const template = gofsDeepLinksGenerator.generateDeepLinksPage(
      request.userModel,
    );
    sendHtml(response, template);
  }
}

function sendHtml(response: Response, body: string) {
  response.setHeader("content-type", "text/html");
  response.status(StatusCodes.OK);
  response.send(body);
}

export const gofsDeepLinksController = new GofsDeepLinksController();

// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Response } from "express";
import { StatusCodes } from "http-status-codes";

export function created<TDto>(
  response: Response,
  dto: TDto,
  contentType = "application/json",
): void {
  sendResponse(response, dto, contentType, StatusCodes.CREATED);
}

export function ok<TDto>(
  response: Response,
  dto: TDto = null,
  contentType = "application/json",
): void {
  sendResponse(response, dto, contentType, StatusCodes.OK);
}

function sendResponse<TDto>(
  response: Response,
  dto: TDto,
  contentType: string,
  httpStatusCode: number,
): void {
  response.setHeader("content-type", contentType);
  const body = dto === null ? null : { data: [dto] };
  response.status(httpStatusCode).send(body);
}

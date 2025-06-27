// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { IApiErrorResponse } from "../shared/expressErrorHandling/apiErrorResponse";
import { IApiErrorBody } from "./apiErrorDto";

import { StatusCodes } from "http-status-codes";

export const internalServerErrorResponse: IApiErrorResponse<IApiErrorBody> =
  Object.freeze({
    httpStatusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    errorDto: {
      error: {
        code: "InternalServerError",
        message: "Internal Server Error",
      },
    },
  });

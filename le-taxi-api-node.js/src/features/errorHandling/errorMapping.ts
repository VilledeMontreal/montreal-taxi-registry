// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { StatusCodes } from 'http-status-codes';
import { IApiErrorResponse } from '../shared/expressErrorHandling/apiErrorResponse';
import { IApiError, IApiErrorBody } from './apiErrorDto';
import { internalServerErrorResponse } from './internalServerErrorResponse';

export function mapErrorToApiErrorResponse(error: any): IApiErrorResponse<IApiErrorBody> {
  if (error.tag === 'MultipleIssuesError') {
    const details: IApiError[] = error.issues.map(issue => ({ message: issue }));
    return createApiErrorResponse(error.httpStatusCode, error.message, details);
  }

  if (error.tag === 'CustomError') {
    return createApiErrorResponse(error.httpStatusCode, error.message);
  }

  if (error.status && error.status !== StatusCodes.INTERNAL_SERVER_ERROR) {
    return createApiErrorResponse(error.status, error.message);
  }

  return internalServerErrorResponse;
}

function createApiErrorResponse(
  httpStatusCode: number,
  message: string,
  details?: IApiError[]
): IApiErrorResponse<IApiErrorBody> {
  const result: IApiErrorResponse<IApiErrorBody> = {
    httpStatusCode,
    errorDto: {
      error: {
        message
      }
    }
  };
  if (details) {
    result.errorDto.error.details = details;
  }
  return result;
}

// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
const { serializeError } = require("serialize-error");
import { StatusCodes } from "http-status-codes";
import _ from "lodash";

/**
 * Represents an API error response for a specific DTO.
 */
export interface IApiErrorResponse<TDto> {
  httpStatusCode: number;
  errorDto: TDto;
}

/**
 * Acts as a function delegate which accepts an error as parameter and returns an ApiErrorResponse<TDto>.
 */
export type MapErrorToApiErrorResponseFn<TDto> = (
  error: any,
) => IApiErrorResponse<TDto>;

/**
 * Determines the appropriate error response to return depending on the boolean value of the debug parameter.
 *
 * @param apiErrorResponse
 * @param internalServerErrorResponse
 * @param debug Set the value to true if you're in a debugging context, false otherwise. Setting it to true could potentially return the full stacktrace of the error.
 *
 */
export function getContextSensitiveErrorResponse<TDto>(
  apiErrorResponse: IApiErrorResponse<TDto>,
  internalServerErrorResponse: IApiErrorResponse<TDto>,
  debug: boolean,
): IApiErrorResponse<TDto> {
  if (!debug && isServerFault(apiErrorResponse)) {
    return internalServerErrorResponse;
  }
  return apiErrorResponse;
}

/**
 * Injects the provided error object to the API error response if the debug parameter is set to true.
 *
 * @param debug When set to true, the provided error will be injected to the API error response, otherwise the API error will be returned as is.
 * @param error The error object that should be injected.
 * @param apiErrorResponse The API error response that should accept the provided error in its body. By default, the error will be injected in an '__debugError' property.
 */
export function injectErrorToErrorResponseIfDebug<TDto>(
  debug: boolean,
  error: any,
  apiErrorResponse: IApiErrorResponse<TDto>,
): TDto {
  if (!debug) {
    return apiErrorResponse.errorDto;
  }
  let errorDtoWithDebugError: any = _.cloneDeep(apiErrorResponse.errorDto);
  if (!errorDtoWithDebugError) {
    errorDtoWithDebugError = {};
  }
  errorDtoWithDebugError.__debugError = serializeError(error);
  return errorDtoWithDebugError;
}
/**
 * Determines whether an API error response belongs to the server error family (HTTP status 500 and higher).
 *
 * @param apiErrorResponse
 */
export function isServerFault<TDto>(
  apiErrorResponse: IApiErrorResponse<TDto>,
): boolean {
  if (!apiErrorResponse) {
    // if the server cannot respond to the client, it's always a server fault.
    return true;
  }
  return apiErrorResponse.httpStatusCode >= StatusCodes.INTERNAL_SERVER_ERROR;
}

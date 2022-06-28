// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export interface IApiErrorBody {
  error: IApiError;
}

export interface IApiError {
  message: string;
  details?: IApiError[];
}

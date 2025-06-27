// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as _ from "lodash";
import { configs } from "../../../config/configs";

// Format in docker farm /api/taxi
// Format in kubernetes /api/taxi/taxi-registry/api/taxi
export function buildApiEndpoint(url: string) {
  const trimmedUrl = _.trim(url, "/");
  const trimmedDomainPath = _.trim(configs.api.domainPath, "/");

  let endpoint = "";
  if (trimmedDomainPath) endpoint += `/api/${trimmedDomainPath}`;
  if (trimmedUrl) endpoint += `/${trimmedUrl}`;

  return endpoint;
}

// Format in docker farm /diagnostics/v1/ping
// Format in kubernetes /diagnostics/taxi/taxi-registry/v1/ping
export function buildDiagnosticsEndpoint(url: string) {
  const trimmedUrl = _.trim(url, "/");
  const trimmedDomainPath = _.trim(configs.api.domainPath, "/");

  let endpoint = "/diagnostics";
  if (trimmedDomainPath) endpoint += `/${trimmedDomainPath}`;
  if (trimmedUrl) endpoint += `/${trimmedUrl}`;

  return endpoint;
}

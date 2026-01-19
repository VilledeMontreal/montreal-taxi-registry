// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from "chai";

import { getAbsoluteUrl } from "../../../config/configs";
import { superagentWithStats } from "../e2eTesting/superagentWithStats";

export async function postSimple<T extends object>(path: string, dto: T) {
  const response = await superagentWithStats
    .post(getAbsoluteUrl(path))
    .send(dto);
  patchResponse(response);
  return response;
}

export async function getSimpleUsingAccessToken(
  path: string,
  accessToken: string,
) {
  const httpCall = superagentWithStats
    .get(getAbsoluteUrl(path))
    .send()
    .set("access_token", accessToken);
  const response = await httpCall;
  return response;
}

export async function postDtoIsString(
  path: string,
  dto: string,
  apiKey: string,
) {
  const httpOperationFunc = superagentWithStats
    .post(getAbsoluteUrl(path))
    .send(dto);
  const response = await setDefaultHeaders(httpOperationFunc, apiKey, null);
  patchResponse(response);
  return response;
}

export async function postTaxiRegistry<T extends object>(
  path: string,
  dto: T,
  apiKey: string,
  defaultApiKey: string,
) {
  const httpOperationFunc = superagentWithStats
    .post(getAbsoluteUrl(path))
    .send(dto);
  const response = await setDefaultHeaders(
    httpOperationFunc,
    apiKey,
    defaultApiKey,
  );
  patchResponse(response);
  return response;
}

export async function getTaxiRegistry(
  path: string,
  apiKey: string,
  defaultApiKey: string,
  eTag: string = null,
  requestCompression = false,
) {
  const httpOperationFunc = superagentWithStats.get(getAbsoluteUrl(path));
  const response = await setDefaultHeaders(
    httpOperationFunc,
    apiKey,
    defaultApiKey,
    eTag,
    requestCompression,
  );
  patchResponse(response);
  return response;
}

export async function getTaxiAttachedCsv(
  path: string,
  apiKey: string,
  defaultApiKey: string,
) {
  const httpOperationFunc = superagentWithStats.get(getAbsoluteUrl(path));
  const response = await setDefaultHeaders(
    httpOperationFunc,
    apiKey,
    defaultApiKey,
  );
  return response;
}

export async function putTaxiRegistry<T extends object>(
  path: string,
  dto: T,
  apiKey: string,
  defaultApiKey: string,
) {
  const httpOperationFunc = superagentWithStats
    .put(getAbsoluteUrl(path))
    .send(dto);
  const response = await setDefaultHeaders(
    httpOperationFunc,
    apiKey,
    defaultApiKey,
  );
  patchResponse(response);
  return response;
}

async function setDefaultHeaders(
  httpOperationFunc: any,
  apiKey: string,
  defaultApiKey: string,
  eTag?: string,
  requestCompression?: boolean,
) {
  const apiKeyOrDefault = apiKey ? apiKey : defaultApiKey;
  assert.ok(apiKeyOrDefault, "an api key (explicit or default) is required");

  const requestToReturn = httpOperationFunc
    .set("X-API-KEY", apiKeyOrDefault)
    .set("Content-Type", "application/json");

  if (requestCompression) requestToReturn.set("Accept-Encoding", "gzip");
  if (eTag) requestToReturn.set("If-None-Match", eTag);

  return requestToReturn;
}

/**
 * This function parse response.text to response.body like
 * an application/json because Python send a text/HTML
 * meanwhile use patchResponse until Node js API will be deployed
 * to create and update
 *
 */

function patchResponse(response: any) {
  if (response.header["content-type"] === "text/html; charset=utf-8") {
    response.body = JSON.parse(response.text);
  }
  return response;
}

export async function downloadFile(
  path: string,
  fileName: string,
  apiKey: string,
  defaultApiKey: string,
) {
  const httpOperationFunc = superagentWithStats.get(
    getAbsoluteUrl(path + fileName),
  );
  const response = await setDefaultHeaders(
    httpOperationFunc,
    apiKey,
    defaultApiKey,
  );
  return response;
}

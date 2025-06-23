// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request } from "express";
import { BadRequestError, NotModifiedError } from "../../errorHandling/errors";
import { toUtcIsoString } from "../dateUtils/dateUtils";
import { generateEtag } from "../eTags/eTagUtils";

function validateEtag(request: Request, lastDate: string): Request {
  const etagReceived = request.get("if-none-match");
  if (!etagReceived) return request;

  const lastDateEtag = generateEtag(lastDate);
  if (etagReceived === lastDateEtag) throw new NotModifiedError("No new data");

  return request;
}

function validateDate(request: Request): string {
  try {
    return toUtcIsoString(request.params.date);
  } catch (e) {
    throw new BadRequestError(
      "Invalid date format received. Ex:YYYY-MM-DDThh:mm:ss.nnnZ"
    );
  }
}

function validateEncoding(request: Request): Request {
  if (request.header("accept-encoding")?.toLowerCase() !== "gzip") {
    throw new BadRequestError(
      `Invalid header. 'Accept-Encoding' header must be set to 'gzip'`
    );
  }
  return request;
}

export { validateDate, validateEtag, validateEncoding };

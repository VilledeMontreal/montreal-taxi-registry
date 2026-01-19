// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { inquiryProcessor } from "../../inquiry/inquiry.processor";
import { addMinutes, nowUtcIsoString } from "../../shared/dateUtils/dateUtils";
import { allow } from "../../users/securityDecorator";
import { UserRole } from "../../users/userRole";
import { GtfsInquiryResponseDto } from "./gtfsInquiry.dto";
import { gtfsInquiryMapper } from "./gtfsInquiry.mapper";
import { validateGtfsInquiryRequest } from "./gtfsInquiry.validators";

class GtfsInquiryController {
  @allow([UserRole.Admin, UserRole.Motor])
  public async postInquiry(request: Request, response: Response) {
    const inquiryRequest = await validateGtfsInquiryRequest(request);
    const inquiryResponse = await inquiryProcessor.process(inquiryRequest);

    if (!inquiryResponse) {
      sendResponse(response);
      return;
    }

    const gtfsResponse =
      gtfsInquiryMapper.toGtfsInquiryResponse(inquiryResponse);
    sendResponse(response, gtfsResponse);
  }
}

function sendResponse(
  response: Response,
  gtfsResponse?: GtfsInquiryResponseDto,
) {
  const defaultResponse = {
    validUntil: addMinutes(nowUtcIsoString(), 5),
    options: [],
  };

  response.status(StatusCodes.OK);
  response.json(gtfsResponse ?? defaultResponse);
}

export const gtfsInquiryController = new GtfsInquiryController();

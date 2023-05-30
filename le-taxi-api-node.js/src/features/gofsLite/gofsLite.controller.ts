// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { inquiryProcessor } from '../inquiry/inquiry.processor';
import { nowAsEpoch } from '../shared/dateUtils/dateUtils';
import { allow } from '../users/securityDecorator';
import { UserRole } from '../users/userRole';
import { GofsLiteWaitTimeResponseDto } from './gofsLite.dto';
import { gofsLiteMapper } from './gofsLite.mapper';
import { validateGofsLiteWaitTimeRequest } from './gofsLite.validators';

class GofsLiteController {
  @allow([UserRole.Admin, UserRole.Motor])
  public async postWaitTime(request: Request, response: Response) {
    const inquiryRequest = await validateGofsLiteWaitTimeRequest(request);
    const inquiryResponse = await inquiryProcessor.process(inquiryRequest);

    if (!inquiryResponse) {
      sendResponse(response);
      return;
    }

    const gofsResponse = await gofsLiteMapper.toGofsLiteWaitTimeResponse(inquiryResponse);
    sendResponse(response, gofsResponse);
  }
}

function sendResponse(response: Response, gofsResponse?: GofsLiteWaitTimeResponseDto) {
  const defaultResponse = {
    last_updated: nowAsEpoch(),
    ttl: 5 * 60,
    version: "1.0",
    options: []
  };

  response.status(StatusCodes.OK);
  response.json(gofsResponse ?? defaultResponse);
}

export const gofsLiteController = new GofsLiteController();

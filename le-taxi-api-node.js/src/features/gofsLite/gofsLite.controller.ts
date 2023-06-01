// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getAbsoluteUrl } from '../../utils/configs/system';
import { inquiryProcessor } from '../inquiry/inquiry.processor';
import { nowAsEpoch } from '../shared/dateUtils/dateUtils';
import { buildApiEndpoint } from '../shared/utils/apiUtils';
import { allow } from '../users/securityDecorator';
import { UserRole } from '../users/userRole';
import { serviceBrandsFunc, systemInformationFunc } from './gofsLite.constants';
import { GofsLiteDataResponseDto, GofsLiteFeedDetailResponseDto, GofsLiteResponseDto } from './gofsLite.dto';
import { gofsLiteMapper } from './gofsLite.mapper';
import { validateGofsLiteWaitTimeRequest, validateLang } from './gofsLite.validators';



class GofsLiteController {
  @allow([UserRole.Admin, UserRole.Motor])
  public async getFeeds(request: Request, response: Response) {
    const feeds = request.app._router.stack
      .filter(layer => layer?.route?.path?.includes('gofs-lite/1/'))
      .map(layer => layer.route.path);
    sendResponse(response, {
      en: { feeds: buildFeed(feeds, 'en') },
      fr: { feeds: buildFeed(feeds, 'fr') }
    }, 24 * 60 * 60);
  }

  @allow([UserRole.Admin, UserRole.Motor])
  public async postWaitTime(request: Request, response: Response) {
    validateLang(request);
    const inquiryRequest = await validateGofsLiteWaitTimeRequest(request);
    const inquiryResponse = await inquiryProcessor.process(inquiryRequest);

    if (!inquiryResponse) {
      sendResponse(response);
      return;
    }

    const gofsResponse = await gofsLiteMapper.toGofsLiteWaitTimeResponse(inquiryResponse);
    sendResponse(response, gofsResponse);
  }

  @allow([UserRole.Admin, UserRole.Motor])
  public async getServiceBrands(request: Request, response: Response) {
    const lang = validateLang(request);
    sendResponse(response, serviceBrandsFunc(lang));
  }

  @allow([UserRole.Admin, UserRole.Motor])
  public async getSystemInformation(request: Request, response, Response) {
    const lang = validateLang(request);
    sendResponse(response, systemInformationFunc(lang));
  }
}

function buildFeed(feeds: string[], lang: string): GofsLiteFeedDetailResponseDto[] {
  return feeds.map(feed => ({
    name: feed.substring(feed.lastIndexOf('/') + 1),
    url: getAbsoluteUrl(buildApiEndpoint(feed.replace(':lang', lang)))
  }))
}

function wrapReponse(response: GofsLiteDataResponseDto, ttl?: number): GofsLiteResponseDto {
  return {
    last_updated: nowAsEpoch(),
    ttl: ttl ?? 5 * 60,
    version: "1.0",
    data: response || null
  }
}

function sendResponse(response: Response, gofsData?: GofsLiteDataResponseDto, ttl?: number) {
  response.status(StatusCodes.OK);
  response.json(wrapReponse(gofsData, ttl) ?? wrapReponse([] as any));
}

export const gofsLiteController = new GofsLiteController();


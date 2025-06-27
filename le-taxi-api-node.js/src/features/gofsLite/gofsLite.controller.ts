// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { getAbsoluteUrl } from "../../utils/configs/system";
import { inquiryProcessor } from "../inquiry/inquiry.processor";
import { nowAsEpoch } from "../shared/dateUtils/dateUtils";
import { allow } from "../users/securityDecorator";
import { UserRole } from "../users/userRole";
import {
  calendars,
  operatingRules,
  serviceBrandsFunc,
  systemInformationFunc,
  zonesFunc,
} from "./gofsLite.constants";
import {
  GofsLiteDataResponseDto,
  GofsLiteFeedDetailResponseDto,
  GofsLiteResponseDto,
} from "./gofsLite.dto";
import { gofsLiteMapper } from "./gofsLite.mapper";
import {
  validateGofsLiteRealtimeBookingRequest,
  validateLang,
} from "./gofsLite.validators";

const API_PREFIX = "/api/gofs-lite/1/";

class GofsLiteController {
  @allow([UserRole.Admin, UserRole.Motor])
  public async getFeeds(request: Request, response: Response) {
    const feeds = request.app._router.stack
      .filter((layer) => layer?.route?.path?.includes(API_PREFIX))
      .map((layer) =>
        layer.route.path.substring(layer.route.path.indexOf(API_PREFIX))
      );
    sendResponse(
      response,
      {
        en: { feeds: buildFeed(feeds, "en") },
        fr: { feeds: buildFeed(feeds, "fr") },
      },
      24 * 60 * 60
    );
  }

  @allow([UserRole.Admin, UserRole.Motor])
  public async getRealtimeBooking(request: Request, response: Response) {
    validateLang(request);
    const inquiryRequest = await validateGofsLiteRealtimeBookingRequest(
      request
    );
    const inquiryResponse = await inquiryProcessor.process(inquiryRequest);

    if (!inquiryResponse) {
      sendResponse(response);
      return;
    }

    const gofsResponse =
      gofsLiteMapper.toGofsLiteRealtimeBookingResponse(inquiryResponse);
    sendResponse(response, gofsResponse);
  }

  @allow([UserRole.Admin, UserRole.Motor])
  public async getServiceBrands(request: Request, response: Response) {
    const lang = validateLang(request);
    sendResponse(response, serviceBrandsFunc(lang));
  }

  @allow([UserRole.Admin, UserRole.Motor])
  public async getSystemInformation(request: Request, response: Response) {
    const lang = validateLang(request);
    sendResponse(response, systemInformationFunc(lang));
  }

  @allow([UserRole.Admin, UserRole.Motor])
  public async getZones(request: Request, response: Response) {
    const lang = validateLang(request);
    sendResponse(response, zonesFunc(lang));
  }

  @allow([UserRole.Admin, UserRole.Motor])
  public async getOperatingRules(request: Request, response: Response) {
    validateLang(request);
    sendResponse(response, operatingRules);
  }

  @allow([UserRole.Admin, UserRole.Motor])
  public async getCalendars(request: Request, response: Response) {
    validateLang(request);
    sendResponse(response, calendars);
  }
}

function buildFeed(
  feeds: string[],
  lang: string
): GofsLiteFeedDetailResponseDto[] {
  return feeds.map((feed) => ({
    name: feed.substring(feed.lastIndexOf("/") + 1).replace(".json", ""),
    url: getAbsoluteUrl(feed.replace(":lang", lang)),
  }));
}

function wrapResponse(
  response: GofsLiteDataResponseDto,
  ttl?: number
): GofsLiteResponseDto {
  return {
    last_updated: nowAsEpoch(),
    ttl: ttl ?? 5 * 60,
    version: "1.0",
    data: response || [],
  };
}

function sendResponse(
  response: Response,
  gofsData?: GofsLiteDataResponseDto,
  ttl?: number
) {
  response.status(StatusCodes.OK);
  response.json(wrapResponse(gofsData, ttl));
}

export const gofsLiteController = new GofsLiteController();

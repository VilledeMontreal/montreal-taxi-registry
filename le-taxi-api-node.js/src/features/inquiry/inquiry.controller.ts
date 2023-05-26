// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { configs } from '../../config/configs';
import { TaxiSummaryModelExtended } from '../latestTaxiPositions/latestTaxiPosition.model';
import { latestTaxiPositionRepository } from '../latestTaxiPositions/latestTaxiPosition.repository';
import { addMinutes, addSec, nowUtcIsoString } from '../shared/dateUtils/dateUtils';
import { osrmRepository } from '../shared/osrm/osrm.repository';
import { allow } from '../users/securityDecorator';
import { userRepositoryByIdWithCaching } from '../users/user.repositoryWithCaching';
import { UserRole } from '../users/userRole';
import { AssetTypes, InquiryResponseOptionsDTO } from './inquiry.dto';
import { validateInquiryRequest } from './inquiry.validators';

interface IInquiryResponseParams {
  now: string;
  from: any;
  to: any;
  taxi: TaxiSummaryModelExtended;
  waitDuration: number,
  tripDuration: number;
}

class InquiryController {
  @allow([UserRole.Admin, UserRole.Motor])
  public async postInquiry(request: Request, response: Response) {
    const { from, to, assetTypes, operators } = await validateInquiryRequest(request);

    const closestTaxis = await latestTaxiPositionRepository.findLatestTaxiPosition(
      from.coordinates,
      assetTypes,
      operators
    );

    const now = nowUtcIsoString();
    if (!closestTaxis.length) {
      sendResponse(response, now);
      return;
    }

    const routeFromSourceToDestination = await osrmRepository.getRoutes(from.coordinates, to.coordinates);

    const routesFromTaxiPositionToCustomer = await osrmRepository.getTable(
      from.coordinates,
      closestTaxis.map(closestTaxi => ({
        lat: closestTaxi.lat,
        lon: closestTaxi.lon
      }))
    );

    const options = await Promise.all(closestTaxis.map((closestTaxi, i) => toInquiryResponseOptionsDTO({
      now,
      taxi: closestTaxi.taxi,
      from,
      to,
      waitDuration: routesFromTaxiPositionToCustomer[0][i],
      tripDuration: routeFromSourceToDestination[0].legs[0].duration,
    })));

    sendResponse(response, now, options);
  }
}

function sendResponse(response: Response, now: string, options?: InquiryResponseOptionsDTO[]) {
  const inquiryResponse = {
    validUntil: addMinutes(now, 5),
    options: options ?? []
  };

  response.status(StatusCodes.OK);
  response.json(inquiryResponse);
}

async function toInquiryResponseOptionsDTO(params: IInquiryResponseParams): Promise<InquiryResponseOptionsDTO> {
  const operator = await userRepositoryByIdWithCaching.getByKey(params.taxi.operatorId);

  const estimatedWaitTime = params.waitDuration +
    configs.taxiRegistryOsrmApi.estimation.biasInSec +
    configs.taxiRegistryOsrmApi.estimation.requestAndDispatchInSec;
  const estimatedTravelTime = params.tripDuration + configs.taxiRegistryOsrmApi.estimation.biasInSec;
  const departureTime = addSec(params.now, estimatedWaitTime);
  const arrivalTime = addSec(departureTime, estimatedTravelTime);
  const isSpecialNeed = params.taxi.assetType === AssetTypes.SpecialNeed;

  return {
    mainAssetType: {
      id: params.taxi.assetType,
    },
    departureTime,
    arrivalTime,
    from: params.from,
    to: params.to,
    pricing: {
      estimated: true,
      parts: [
        {
          optimisticAmount: 0,
          amount: 0,
          pessimisticAmount: 0,
          currencyCode: 'CAD'
        }
      ]
    },
    estimatedWaitTime,
    estimatedTravelTime,
    booking: {
      agency: {
        id: operator.public_id,
        name: operator.commercial_name
      },
      mainAssetType: {
        id: toMainAssetType(params.taxi.assetType, operator.public_id),
      },
      phoneNumber: isSpecialNeed ? operator.special_need_booking_phone_number : operator.standard_booking_phone_number,
      androidUri: isSpecialNeed ? operator.special_need_booking_android_deeplink_uri : operator.standard_booking_android_deeplink_uri,
      iosUri: isSpecialNeed ? operator.special_need_booking_ios_deeplink_uri : operator.standard_booking_ios_deeplink_uri,
      webUrl: isSpecialNeed ? operator.special_need_booking_website_url : operator.standard_booking_website_url,
    }
  };
}

function toMainAssetType(assetType: AssetTypes, operatorPublicId: string) {
  const assetTypeExtension = getMainAssetTypeExtension(assetType);
  return `${operatorPublicId}-${assetTypeExtension}`;
}

function getMainAssetTypeExtension(assetType: AssetTypes) {
  switch (assetType) {
    case AssetTypes.SpecialNeed:
      return 'standard-route';
    case AssetTypes.Mpv:
      return 'minivan-route';
    default:
    case AssetTypes.Normal:
      return 'special-need-route';
  }
}

export const inquiryController = new InquiryController();

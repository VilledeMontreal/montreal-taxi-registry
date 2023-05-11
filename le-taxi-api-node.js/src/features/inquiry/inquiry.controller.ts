// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { configs } from '../../config/configs';
import { latestTaxiPositionRepository } from '../latestTaxiPositions/latestTaxiPosition.repository';
import { addMinutes, addSec, nowUtcIsoString } from '../shared/dateUtils/dateUtils';
import { osrmRepository } from '../shared/osrm/osrm.repository';
import { allow } from '../users/securityDecorator';
import { UserRole } from '../users/userRole';
import { AssetTypes, InquiryResponseOptionsDTO } from './inquiry.dto';
import { validateInquiryRequest } from './inquiry.validators';

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

    sendResponse(response, now, () =>
      closestTaxis.map((closestTaxi, i) => {
        const departureTime = addSec(
          now,
          routesFromTaxiPositionToCustomer[0][i] +
            configs.taxiRegistryOsrmApi.estimation.biasInSec +
            configs.taxiRegistryOsrmApi.estimation.requestAndDispatchInSec
        );
        const arrivalTime = addSec(
          departureTime,
          routeFromSourceToDestination[0].legs[0].duration + configs.taxiRegistryOsrmApi.estimation.biasInSec
        );

        return {
          mainAssetType: {
            id: toMainAssetType((closestTaxi.taxi as any).assetType, closestTaxi.taxi.operatorPublicId)
          },
          departureTime,
          arrivalTime,
          from,
          to,
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
          }
        };
      })
    );
  }
}

function sendResponse(response: Response, now: string, callback?: () => InquiryResponseOptionsDTO[]) {
  const inquiryResponse = {
    validUntil: addMinutes(now, 5),
    options: callback ? callback() : []
  };

  response.status(StatusCodes.OK);
  response.json(inquiryResponse);
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

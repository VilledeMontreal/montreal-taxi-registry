// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errorHandling/errors';
import { latestTaxiPositionRepository } from '../latestTaxiPositions/latestTaxiPosition.repository';
import { addMinutes, addSec, nowUtcIsoString } from '../shared/dateUtils/dateUtils';
import { osrmRepository } from '../shared/osrm/osrm.repository';
import { allow } from '../users/securityDecorator';
import { UserRole } from '../users/userRole';
import { AssetTypes, InquiryResponseDTO } from './inquiry.dto';
import { validateInquiryRequest } from './inquiry.validators';

const timingToleranceFactor = 0.2;

class InquiryController {
  @allow([UserRole.Admin, UserRole.Motor])
  public async postInquiry(request: Request, response: Response) {
    const { from, to, assetType, operators } = await validateInquiryRequest(request);

    const closestTaxi = await latestTaxiPositionRepository.findLatestTaxiPosition(
      from.coordinates,
      assetType === AssetTypes.Mpv,
      assetType === AssetTypes.SpecialNeed,
      operators
    );

    if (!closestTaxi) {
      throw new NotFoundError('Closest taxi could not be found.');
    }

    const routesToClosestTaxi = await osrmRepository.getRoutes(from.coordinates, to.coordinates, {
      lat: closestTaxi.lat,
      lon: closestTaxi.lon
    });

    const now = nowUtcIsoString();
    const [legTaxiToSource, legSourceToDestination] = routesToClosestTaxi[0].legs;
    const departureTime = addSec(now, legTaxiToSource.duration);
    const arrivalTime = addSec(departureTime, legSourceToDestination.duration);
    const departureDelta = legTaxiToSource.duration * timingToleranceFactor;
    const arrivalDelta = legSourceToDestination.duration * timingToleranceFactor;

    const inquiryResponse: InquiryResponseDTO = {
      validUntil: addMinutes(now, 5),
      options: [
        {
          mainAssetType: { id: toMainAssetType(assetType, closestTaxi.taxi.operatorPublicId) },
          optimisticDepartureTime: addSec(departureTime, -departureDelta),
          departureTime,
          pessimisticDepartureTime: addSec(departureTime, departureDelta),
          optimisticArrivalTime: addSec(arrivalTime, -arrivalDelta),
          arrivalTime,
          pessimisticArrivalTime: addSec(arrivalTime, arrivalDelta),
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
        }
      ]
    };

    response.status(StatusCodes.OK);
    response.json(inquiryResponse);
  }
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

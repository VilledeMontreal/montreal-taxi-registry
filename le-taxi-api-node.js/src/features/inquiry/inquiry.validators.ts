// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import booleanContains from '@turf/boolean-contains';
import * as turf from '@turf/helpers';
import { Request } from 'express';
import { configs } from '../../config/configs';
import { BadRequestError } from '../errorHandling/errors';
import { ICoordinates } from '../shared/coordinates/coordinates';
import { isNumber, validateCoordinates, validateDtoProperties } from '../shared/validations/validators';
import { AssetTypes, InquiryRequest } from './inquiry.dto';
import { YUL_HAIL_TAXI_RESTRICTED_AREA } from './inquiryRestrictedArea';

export async function validateInquiryRequest(request: Request): Promise<any> {
  await validateDtoProperties(new InquiryRequest(), request.body);

  const fromCoordinate = validateCoordinates(request?.body?.from?.coordinates);
  validateYulHailTaxiRestrictedArea(fromCoordinate);
  const toCoordinate = validateCoordinates(request?.body?.to?.coordinates);
  const assetType = validateAssetType(request?.body?.useAssetTypes);
  const operators = validateOperators(request?.body?.operators);
  return {
    assetType,
    from: {
      coordinates: fromCoordinate
    },
    to: {
      coordinates: toCoordinate
    },
    operators
  };
}

function validateYulHailTaxiRestrictedArea(coordinate: ICoordinates): void {
  const yulTaxiRestrictedArea = turf.polygon([YUL_HAIL_TAXI_RESTRICTED_AREA], { name: 'yul-taxi-restricted-area' });
  const userPosition = turf.point([coordinate.lon, coordinate.lat]);
  const isPointContain = booleanContains(yulTaxiRestrictedArea, userPosition);

  if (isPointContain) {
    const NEAR_AIRPORT_ERROR_MSG = `Searching or hailing a taxi from the Montreal airport (YUL) zone is prohibited.`;
    throw new BadRequestError(NEAR_AIRPORT_ERROR_MSG);
  }
}

function validateAssetType(assetTypes: AssetTypes[]): AssetTypes {
  return assetTypes[0];
}

function validateOperators(operators: string[]): number[] {
  if (!operators || operators.length === 0 || !configs.environment.isLocalOrDev) return null;

  return operators.map(operator => {
    if (!isNumber(operator)) throw new BadRequestError(`The operators must be numbers`);
    return +operator;
  });
}

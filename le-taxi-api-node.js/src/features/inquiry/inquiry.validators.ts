// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import booleanContains from '@turf/boolean-contains';
import * as turf from '@turf/helpers';
import { Request } from 'express';
import { configs } from '../../config/configs';
import { BadRequestError } from '../errorHandling/errors';
import { ICoordinates } from '../shared/coordinates/coordinates';
import { yul_airport_restricted_area } from '../shared/locations/locations';
import { isNumber, validateCoordinates, validateDtoProperties } from '../shared/validations/validators';
import { AssetTypes, InquiryRequest } from './inquiry.dto';

export async function validateInquiryRequest(request: Request): Promise<any> {
  await validateDtoProperties(new InquiryRequest(), request.body);

  const fromCoordinate = validateCoordinates(request?.body?.from?.coordinates);
  validateYulTaxiRestrictedArea(fromCoordinate);
  const toCoordinate = validateCoordinates(request?.body?.to?.coordinates);
  const assetTypes = validateAssetType(request?.body?.useAssetTypes);
  const operators = validateOperators(request?.body?.operators);
  return {
    assetTypes,
    from: {
      coordinates: fromCoordinate
    },
    to: {
      coordinates: toCoordinate
    },
    operators
  };
}

function validateYulTaxiRestrictedArea(coordinate: ICoordinates): void {
  const yulTaxiRestrictedArea = turf.polygon([yul_airport_restricted_area], { name: 'yul-taxi-restricted-area' });
  const userPosition = turf.point([coordinate.lon, coordinate.lat]);
  const isPointContain = booleanContains(yulTaxiRestrictedArea, userPosition);

  if (isPointContain) {
    throw new BadRequestError('Requesting a taxi from the Montreal airport (YUL) zone is prohibited.');
  }
}

function validateAssetType(assetTypes: AssetTypes[]): AssetTypes[] {
  return assetTypes.filter((assetType, i) => assetTypes.indexOf(assetType) === i);
}

function validateOperators(operators: string[]): number[] {
  if (!operators || operators.length === 0 || !configs.environment.isLocalOrDev) return null;

  return operators.map(operator => {
    if (!isNumber(operator)) throw new BadRequestError(`The operators must be numbers`);
    return +operator;
  });
}

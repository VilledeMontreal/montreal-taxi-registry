// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import booleanContains from '@turf/boolean-contains';
import * as turf from '@turf/helpers';
import { configs } from '../../config/configs';
import { BadRequestError } from '../errorHandling/errors';
import { ICoordinates } from '../shared/coordinates/coordinates';
import { airportGeometry } from '../shared/locations/locations';
import { InquiryRequest, InquiryTypes } from './inquiry.dto';

export function validateInquiryRequest(inquiryRequest: InquiryRequest): InquiryRequest {
  validateYulTaxiRestrictedArea(inquiryRequest.from);
  const inquiryTypes = validateInquiryTypes(inquiryRequest.inquiryTypes);
  const operators = validateOperators(inquiryRequest.operators);
  return forceTypes({
    ...inquiryRequest,
    inquiryTypes,
    operators
  });
}

function forceTypes(inquiryRequest: InquiryRequest): InquiryRequest {
  return {
    from: {
      lat: +inquiryRequest.from.lat,
      lon: +inquiryRequest.from.lon
    },
    to: {
      lat: +inquiryRequest.to?.lat,
      lon: +inquiryRequest.to?.lon
    },
    inquiryTypes: inquiryRequest.inquiryTypes,
    operators: inquiryRequest.operators?.map(operator => +operator)
  };
}

function validateYulTaxiRestrictedArea(coordinate: ICoordinates): void {
  const yulTaxiRestrictedArea = turf.polygon([airportGeometry], { name: 'yul-taxi-restricted-area' });
  const userPosition = turf.point([coordinate.lon, coordinate.lat]);
  const isPointContain = booleanContains(yulTaxiRestrictedArea, userPosition);

  if (isPointContain) {
    throw new BadRequestError('Requesting a taxi from the Montreal airport (YUL) zone is prohibited.');
  }
}

function validateInquiryTypes(inquiryTypes: InquiryTypes[]): InquiryTypes[] {
  if (!inquiryTypes || inquiryTypes.length === 0) return Object.values(InquiryTypes);
  return inquiryTypes.filter((inquiryType, i) => inquiryTypes.indexOf(inquiryType) === i);
}

function validateOperators(operators: number[]): number[] {
  return !operators || operators.length === 0 || !configs.environment.isLocalOrDev ? null : operators;
}

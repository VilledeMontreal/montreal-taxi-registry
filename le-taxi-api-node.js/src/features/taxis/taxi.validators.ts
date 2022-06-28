// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request } from 'express';
import { isInseeHasPermitSemanticForADS } from '../ads/ads.dto';
import { isLegacyDepartement } from '../drivers/driver.dto';
import { BadRequestError } from '../errorHandling/errors';
import { convertStringToBoolean } from '../shared/typeConversions/fromString';
import { validateRequest } from '../shared/validations/validateRequest';
import { validateArrayLimit, validateArrayNotEmpty } from '../shared/validations/validators';
import { isLegacyLicensePlate } from '../vehicles/vehicle.dto';
import { DeprecatedUpdateTaxiRequestDto, TaxiRequestDto } from './taxi.dto';

export async function validateDeprecatedUpdateRequest(request: Request): Promise<DeprecatedUpdateTaxiRequestDto> {
  const taxis: DeprecatedUpdateTaxiRequestDto[] = request.body.data;
  validateArrayNotEmpty(taxis);
  validateArrayLimit(taxis, 1);

  // Discouraged call but still valid request as per the operator guide
  // Only thing we have to take care of is the private field
  coercePrivateToCorrectType(taxis[0]);

  return taxis[0];
}

function coercePrivateToCorrectType(row: Record<string, any>) {
  if (!row.private) {
    row.private = false;
  }
  if (typeof row.private === 'string') {
    row.private = convertStringToBoolean(row.private);
  }
}

export async function validateTaxiRequest(request: Request): Promise<TaxiRequestDto> {
  const taxi = await validateRequest(request, new TaxiRequestDto());
  ensureNoMixingOfADSOwnerWithLegacyEntities(taxi);

  return taxi;
}

function ensureNoMixingOfADSOwnerWithLegacyEntities(row: TaxiRequestDto) {
  if (isInseeHasPermitSemanticForADS(row?.ads?.insee)) {
    return;
  }

  if (isLegacyDepartement(row?.driver?.departement)) {
    throw new BadRequestError(
      `Once the owner (${row?.ads?.numero}) is compliant with bill 17, the driver${row?.driver.professional_licence} must also be compliant.`
    );
  }

  if (isLegacyLicensePlate(row?.vehicle?.licence_plate)) {
    throw new BadRequestError(
      `Once the owner (${row?.ads?.numero}) is compliant with bill 17, the vehicle (${row?.vehicle?.licence_plate}) must also be compliant.`
    );
  }
}

// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { configs } from '../../config/configs';
import { generateSouthShoreCoordinates } from '../shared/commonLoadTests/specialRegion';
import { aFewSeconds } from '../shared/commonTests/testUtil';
import {
  AssetTypes,
  CoordinateDTO,
  InquiryRequestDTO,
  ITaxiResponseDto,
  IUser
} from '../shared/taxiRegistryDtos/taxiRegistryDtos';
import { setTaxiPosition } from '../taxiPositionSnapShots/taxiPositionSnapshots.fixture';
import { setupNewCustomTaxi } from '../taxis/taxi.fixture';
import { updateUser } from '../users/user.apiClient';
import { createOperatorWithPromotion, IPromotions } from '../users/user.sharedFixture';

interface ITaxiPositions {
  lat?: number;
  lon?: number;
  status?: string;
}

export interface ITaxiOptions extends ITaxiPositions {
  type?: string;
  specialNeedVehicle?: boolean;
}

export function buildInquiryRequest(
  fromCoordinate: CoordinateDTO,
  toCoordinate: CoordinateDTO,
  assetType: AssetTypes,
  operators?: IUser[]
): InquiryRequestDTO {
  return {
    from: { coordinates: fromCoordinate },
    to: { coordinates: toCoordinate },
    useAssetTypes: [assetType],
    operators: operators?.map(operator => operator.id)
  };
}

export async function createTaxisWithPromotions(
  taxiOptions: ITaxiOptions[],
  promotion: IPromotions = { standard: true, minivan: true, special_need: true }
): Promise<IUser[]> {
  return await Promise.all(
    taxiOptions.map(async option => {
      const newOperator = await createOperatorWithPromotion(promotion);
      await setupTaxiFromOptions(option, newOperator.apikey);
      return newOperator;
    })
  );
}

function fillDefaultOptions(options: ITaxiOptions): ITaxiOptions {
  const { lat, lon } = generateSouthShoreCoordinates();
  return {
    lat: options.lat || lat,
    lon: options.lon || lon,
    status: options.status || 'free',
    type: options.type || 'sedan',
    specialNeedVehicle: options.specialNeedVehicle || false
  };
}

export async function setupTaxiFromOptions(taxiOptions: ITaxiOptions, apikey?: string) {
  const options = fillDefaultOptions(taxiOptions);
  const taxi = await setupNewCustomTaxi(options.specialNeedVehicle, options.type, apikey);
  await setTaxiPosition(
    {
      taxi: taxi.body.data[0].id,
      operator: taxi.body.data[0].operator,
      lat: options.lat,
      lon: options.lon,
      status: options.status
    },
    apikey
  );

  return taxi.body.data[0];
}

export async function demoteOperatorTaxis(operator: IUser, taxi: ITaxiResponseDto) {
  const { lat, lon } = generateSouthShoreCoordinates();

  // Demote the operator
  const operatorApikey = operator.apikey;
  delete operator.password;
  delete operator.apikey;
  operator.standard_booking_is_promoted_to_public = false;
  operator.minivan_booking_is_promoted_to_public = false;
  operator.special_need_booking_is_promoted_to_public = false;
  await updateUser(operator);

  // Wait for user cache to expire and push a position so the change is effective
  await aFewSeconds(configs.caching.delayToExceedUsersCache);
  await setTaxiPosition(
    {
      taxi: taxi.id,
      operator: taxi.operator,
      lat: lat,
      lon: lon,
      status: 'free'
    },
    operatorApikey
  );
}

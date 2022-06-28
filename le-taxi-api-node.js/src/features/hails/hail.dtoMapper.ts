// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { LatestTaxiPositionModel } from '../latestTaxiPositions/latestTaxiPosition.model';
import { nowUtcIsoString, toUtcHumanDate } from '../shared/dateUtils/dateUtils';
import { UserModel } from '../users/user.model';
import { HailResponseDto } from './hail.dto';
import { ANONYMOUS_CUSTOMER_ID, HailModel } from './hail.model';
import { getCurrentStatus } from './statuses/hailStatuses';

export class HailDtoMapper {
  public static toHailResponseDto(
    hailModel: HailModel,
    operator: UserModel,
    latestTaxiPositionModel?: LatestTaxiPositionModel,
    taxiToOperator?: any
  ): HailResponseDto {
    const taxiRelationAndVignette = taxiToOperator && taxiToOperator.rows[0] ? taxiToOperator.rows[0] : null;

    const hailDto: HailResponseDto = {
      creation_datetime: toUtcHumanDate(hailModel.creation_datetime),
      customer_address: hailModel.customer_address,
      customer_id: ANONYMOUS_CUSTOMER_ID,
      customer_lat: hailModel.customer_lat,
      customer_lon: hailModel.customer_lon,
      customer_phone_number: hailModel.customer_phone_number,
      id: hailModel.id,
      incident_customer_reason: hailModel.incident_customer_reason,
      incident_taxi_reason: hailModel.incident_taxi_reason,
      last_status_change: toUtcHumanDate(hailModel.last_persisted_status_change),
      operateur: operator.email,
      rating_ride: hailModel.rating_ride,
      rating_ride_reason: hailModel.rating_ride_reason,
      reporting_customer: hailModel.reporting_customer,
      reporting_customer_reason: hailModel.reporting_customer_reason,
      status: getCurrentStatus(hailModel, nowUtcIsoString()),
      taxi: {
        id: hailModel.taxi_id,
        last_update: latestTaxiPositionModel.timestampUnixTime,
        position: {
          lat: latestTaxiPositionModel.lat,
          lon: latestTaxiPositionModel.lon
        }
      },
      taxi_relation: {
        rating: taxiRelationAndVignette.rating,
        ban_end: taxiRelationAndVignette.ban_end,
        ban_begin: taxiRelationAndVignette.ban_begin
      },
      taxi_vignette: taxiRelationAndVignette.taxi_vignette,
      taxi_phone_number: hailModel.taxi_phone_number,
      hail: []
    };
    return hailDto;
  }
}

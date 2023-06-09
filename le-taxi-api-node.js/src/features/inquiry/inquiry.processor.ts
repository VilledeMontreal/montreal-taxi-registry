// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import booleanContains from '@turf/boolean-contains';
import * as turf from '@turf/helpers';
import { configs } from '../../config/configs';
import { latestTaxiPositionRepository } from '../latestTaxiPositions/latestTaxiPosition.repository';
import { ICoordinates } from '../shared/coordinates/coordinates';
import { nowUtcIsoString, toLocalDate } from '../shared/dateUtils/dateUtils';
import { airportGeometry, downtownGeometry } from '../shared/locations/locations';
import { osrmRepository } from '../shared/osrm/osrm.repository';
import { userRepositoryByIdWithCaching } from '../users/user.repositoryWithCaching';
import { InquiryRequest, InquiryResponse } from './inquiry.dto';

interface IEstimatePriceProperties {
  date: string;
  from: ICoordinates;
  to: ICoordinates;
  duration: number;
  distance: number;
}

class InquiryProcessor {
  public async process(inquiryRequest: InquiryRequest): Promise<InquiryResponse> {
    const closestTaxiPromise = latestTaxiPositionRepository.findClosestTaxis(
      inquiryRequest.from,
      inquiryRequest.inquiryTypes,
      inquiryRequest.operators
    );
    const routeFromSourceToDestinationPromise = inquiryRequest.to
      ? osrmRepository.getRoutes(inquiryRequest.from, inquiryRequest.to)
      : [];

    const [closestTaxis, routeFromSourceToDestination] = await Promise.all([
      closestTaxiPromise,
      routeFromSourceToDestinationPromise
    ]);

    if (!closestTaxis.length) return null;

    const routesFromTaxiPositionToCustomer = await osrmRepository.getTable(
      inquiryRequest.from,
      closestTaxis.map(closestTaxi => ({
        lat: closestTaxi.lat,
        lon: closestTaxi.lon
      }))
    );

    const date = nowUtcIsoString();
    const estimatedDuration = routeFromSourceToDestination[0].legs[0].duration;
    const estimatedDistance = routeFromSourceToDestination[0].legs[0].distance;
    const estimatedPrice = estimatePrice({
      date,
      from: inquiryRequest.from,
      to: inquiryRequest.to,
      duration: estimatedDuration,
      distance: estimatedDistance
    });
    const data = await Promise.all(
      closestTaxis.map(async (closestTaxi, i) => ({
        date,
        inquiryType: closestTaxi.taxi.inquiryType,
        operator: await userRepositoryByIdWithCaching.getByKey(closestTaxi.taxi.operatorId),
        from: inquiryRequest.from,
        to: inquiryRequest.to,
        estimatedWaitTime:
          routesFromTaxiPositionToCustomer[0][i] +
          configs.taxiRegistryOsrmApi.estimation.durationBias +
          configs.taxiRegistryOsrmApi.estimation.requestAndDispatchInSec,
        estimatedTravelTime: estimatedDuration + configs.taxiRegistryOsrmApi.estimation.durationBias,
        estimatedPrice
      }))
    );

    return { data };
  }
}

function estimatePrice(props: IEstimatePriceProperties): number {
  const fromPosition = turf.point([props.from.lon, props.from.lat]);
  const downtown = turf.polygon(downtownGeometry, { name: 'downtownGeometry' });
  const isFromDowntown = booleanContains(downtown, fromPosition);

  const toPosition = turf.point([props.to.lon, props.to.lat]);
  const airport = turf.polygon([airportGeometry], { name: 'airport' });
  const isToAirport = booleanContains(airport, toPosition);

  const localDate = toLocalDate(props.date);
  const hours = localDate.getHours();
  const isDay = hours >= 5 && hours < 23;

  if (isFromDowntown && isToAirport) {
    return isDay
      ? configs.inquiries.fixedDailyPriceDowntownToAirport
      : configs.inquiries.fixedNightlyPriceDowntownToAirport;
  }

  return estimateRate(props.duration, props.distance, isDay);
}

function estimateRate(duration: number, distance: number, isDay: boolean) {
  const durationBias = configs.taxiRegistryOsrmApi.estimation.durationBias;
  const durationRatio = isDay
    ? configs.taxiRegistryOsrmApi.estimation.durationDailyRateRatio
    : configs.taxiRegistryOsrmApi.estimation.durationNightlyRateRatio;
  const distanceBias = configs.taxiRegistryOsrmApi.estimation.distanceBias;
  const distanceRatio = isDay
    ? configs.taxiRegistryOsrmApi.estimation.distanceDailyRateRatio
    : configs.taxiRegistryOsrmApi.estimation.distanceNightlyRateRatio;
  const compensation = isDay
    ? configs.taxiRegistryOsrmApi.estimation.dailyCompensationRate
    : configs.taxiRegistryOsrmApi.estimation.nightlyCompensationRate;
  const price =
    Math.ceil((duration + durationBias) / 60) * durationRatio +
    Math.ceil((distance + distanceBias) / 1000) * distanceRatio +
    compensation;
  return Math.round(price * 100) / 100;
}

export const inquiryProcessor = new InquiryProcessor();

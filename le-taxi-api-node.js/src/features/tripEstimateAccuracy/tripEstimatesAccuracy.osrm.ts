// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { addSec } from '../shared/dateUtils/dateUtils';
import { osrmRepository } from '../shared/osrm/osrm.repository';
import { EstimatedTrip, RealTrip } from '../tripEstimates/tripEstimate.model';

export async function estimateWithOsrm(realTrip: RealTrip, testExecutionId: number): Promise<EstimatedTrip> {
  const [route] = await osrmRepository.getRoutes(
    { lat: realTrip.departure_lat, lon: realTrip.departure_lon },
    { lat: realTrip.arrival_lat, lon: realTrip.arrival_lon }
  );
  
  return {
    real_trip_id: Number(realTrip.id),
    test_execution_id: testExecutionId,
    estimated_arrival_time: estimateArrivalTime(new Date(realTrip.departure_time), route.duration),
    // !!! Important !!!
    // route.distance can be used to perform stats analysis on distance with the same query used 
    // for duration.
    //
    // Queries for duration:
    // https://drive.google.com/file/d/1z_jV-EHQJLwtlqHcfWBldYs0pTavn_Qa/view?usp=sharing
    //
    // Queries for distance/cost:
    // https://drive.google.com/file/d/1otKStm3GsqrXdVTxV-Vc6E_n2sGYG5MR/view?usp=sharing
    //
    estimated_trip_duration_seconds: Math.round(route.duration),
    trip_duration_absolute_error_percent: calculateErrorPercent(realTrip.duration_seconds, route.duration),
    is_longer_than_real_trip: isLongerThanRealTrip(realTrip.duration_seconds, route.duration)
  };
}

function calculateErrorPercent(realTripDuration: number, estimatedTripDuration: number): number {
  const HUNDRED = 100;

  let error = (Math.abs(estimatedTripDuration - realTripDuration) / Math.abs(realTripDuration)) * HUNDRED;

  if (error === Number.POSITIVE_INFINITY) error = HUNDRED;

  return Math.round(Number(error));
}

function estimateArrivalTime(departureTime: Date, routeDurationSec: number): string {
  return addSec(departureTime.toISOString(), routeDurationSec);
}

function isLongerThanRealTrip(realTripDuration: number, estimatedTripDuration: number): boolean {
  return estimatedTripDuration > realTripDuration;
}

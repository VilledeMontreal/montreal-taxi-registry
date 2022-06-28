// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { TripModel } from '../trips/trip.model';

class TripEstimateMapper {
  public toTaxiEstimatePersistanceArray(sampleId: number, trips: TripModel[]): any[] {
    return trips.map(trip => this.toTaxiEstimatePersistance(sampleId, trip));
  }

  public toTaxiEstimatePersistance(sampleId: number, trip: TripModel): any {
    return {
      sample_id: sampleId,
      departure_time: trip.departureTime,
      departure_lat: trip.departureLat,
      departure_lon: trip.departureLon,
      arrival_time: trip.arrivalTime,
      arrival_lat: trip.arrivalLat,
      arrival_lon: trip.arrivalLon,
      duration_seconds: Math.round(trip.totalDurationSeconds),
      distance_meters: Math.round(trip.distanceMeters)
    };
  }
}

export const tripEstimateMapper = new TripEstimateMapper();

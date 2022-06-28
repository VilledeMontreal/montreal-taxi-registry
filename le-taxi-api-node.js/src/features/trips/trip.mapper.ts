// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { TripModel } from './trip.model';

class TripMapper {
  public toPersistanceArray(trips: TripModel[]): any[] {
    return trips.map(trip => this.toPersistance(trip));
  }

  public toPersistance(trip: TripModel): any {
    return {
      departure_time: trip.departureTime,
      arrival_time: trip.arrivalTime,
      departure_lat: trip.departureLat,
      departure_lon: trip.departureLon,
      arrival_lat: trip.arrivalLat,
      arrival_lon: trip.arrivalLon,
      total_duration_seconds: Math.round(trip.totalDurationSeconds),
      idle_duration_seconds: Math.round(trip.idleDurationSeconds),
      distance_meters: Math.round(trip.distanceMeters),
      coordinates: trip.coordinates,
      taxi_path: trip.path,
      confidence: trip.confidence,
      confidence_reason: trip.confidenceReason
    };
  }
}

export const tripMapper = new TripMapper();

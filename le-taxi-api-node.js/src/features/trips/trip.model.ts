// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export class TripModel {
  departureTime: string;
  arrivalTime: string;
  departureLat: number;
  departureLon: number;
  arrivalLat: number;
  arrivalLon: number;
  totalDurationSeconds: number;
  idleDurationSeconds: number;
  distanceMeters: number;
  coordinates: string;
  path: string;
  confidence: ConfidenceScore;
  confidenceReason?: string;
}

export enum ConfidenceScore {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
}

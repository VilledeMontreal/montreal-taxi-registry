// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import assert = require('assert');
import * as turf from '@turf/helpers';
import * as turfLength from '@turf/length';
import { TaxiStatus } from '../../libs/taxiStatus';
import { ICoordinates } from '../shared/coordinates/coordinates';
import { durationInSeconds } from '../shared/dateUtils/dateUtils';
import { TaxiPositionSnapshotItemRequestDto } from '../taxiPositionSnapshot/taxiPositionSnapshotItemRequest.dto';
import { ConfidenceScore, TripModel } from './trip.model';

const tripParserConfig = {
  distanceLowerLimitInMeter: 2000, // 2 km
  distanceUpperLimitInMeter: 100000, // 100 km
  durationLowerLimitInSeconds: 120, // 2 minutes
  durationUpperLimitInSeconds: 1800, // 90 minutes
  averageSpeedLowerLimitInMps: 1.388, // 5 km/h
  averageSpeedUpperLimitInMps: 33.333 // 120 km/h
};

export class TripParser {
  private _taxiId: string;
  private _lastStatus: string;
  private _lastPositionReceivedAt: string;
  private _lastPosition: ICoordinates;
  private _positions: number[][];
  private _cumulativeIdleDuration: number;
  private _currentTrip: TripModel;
  private _completedTrips: TripModel[] = [];

  constructor(id: string) {
    this._taxiId = id;
  }

  public parseTaxiPosition(taxiPosition: TaxiPositionSnapshotItemRequestDto, receivedAt: string): void {
    assert.ok(this._taxiId === taxiPosition.taxi);

    const currentPosition: ICoordinates = {
      lat: +taxiPosition.lat,
      lon: +taxiPosition.lon
    };

    // Make sure to start trips only from a previously defined status
    if (this._lastStatus) {
      if (this._lastStatus !== TaxiStatus.Occupied && taxiPosition.status === TaxiStatus.Occupied) {
        this.startTrip(currentPosition, receivedAt);
      }
      if (this.tripInProgress(receivedAt)) {
        this.processPosition(currentPosition, receivedAt);
        if (this._lastStatus === TaxiStatus.Occupied && taxiPosition.status !== TaxiStatus.Occupied) {
          this.endTrip(currentPosition, receivedAt);
        }
      }
    }

    this._lastPosition = currentPosition;
    this._lastPositionReceivedAt = receivedAt;
    this._lastStatus = taxiPosition.status;
  }

  public getCompletedTrips(): TripModel[] {
    return this._completedTrips;
  }

  public deleteCompletedTrips(): void {
    this._completedTrips = [];
  }

  private startTrip(position: ICoordinates, receivedAt: string) {
    this._currentTrip = new TripModel();
    this._currentTrip.departureTime = receivedAt;
    this._currentTrip.departureLat = position.lat;
    this._currentTrip.departureLon = position.lon;
    this._currentTrip.idleDurationSeconds = 0;

    this._cumulativeIdleDuration = 0;
    this._positions = [[position.lon, position.lat]];
  }

  private endTrip(position: ICoordinates, receivedAt: string) {
    // The real arrivalTime is between lastPositionReceivedAt and taxiPosition.receivedAt
    // This lack of precision is resolved by using taxiPosition.receivedAt.
    // This avoids generating trip outside of the batch boundaries.
    // Respecting the batch bundaries is important because it allows the
    // api clients (and this process) to incrementally synchronize the batches.
    this._currentTrip.arrivalTime = receivedAt;
    this._currentTrip.arrivalLat = position.lat;
    this._currentTrip.arrivalLon = position.lon;
    this.fillEndTripFields();

    this._completedTrips.push(this._currentTrip);

    this._currentTrip = null;
  }

  private tripInProgress(receivedAt: string): boolean {
    return !!this._currentTrip && this._currentTrip.departureTime !== receivedAt;
  }

  private processPosition(position: ICoordinates, receivedAt: string) {
    if (this._lastPosition) {
      const durationSeconds = durationInSeconds(this._lastPositionReceivedAt, receivedAt);
      const distanceMeters = getDistanceInMeters([
        [this._lastPosition.lon, this._lastPosition.lat],
        [position.lon, position.lat]
      ]);

      if (durationSeconds < 1) return;

      validateDuration(this._currentTrip, durationSeconds);
      validateSpeed(this._currentTrip, durationSeconds, distanceMeters);

      if (distanceMeters < 1) {
        this._cumulativeIdleDuration += durationSeconds;
        return;
      }

      // Average red light is 75 seconds, allow some wiggle room
      if (this._cumulativeIdleDuration > 180) {
        this._currentTrip.idleDurationSeconds += this._cumulativeIdleDuration;
        this._cumulativeIdleDuration = 0;
      }

      this._positions.push([position.lon, position.lat]);
    }
  }

  private fillEndTripFields() {
    this._currentTrip.totalDurationSeconds = durationInSeconds(
      this._currentTrip.departureTime,
      this._currentTrip.arrivalTime
    );
    this._currentTrip.distanceMeters = getDistanceInMeters(this._positions);
    this._currentTrip.coordinates = asMultiPoint(
      { lat: this._currentTrip.departureLat, lon: this._currentTrip.departureLon },
      { lat: this._currentTrip.arrivalLat, lon: this._currentTrip.arrivalLon }
    );
    this._currentTrip.path = asLineString(this._positions);
    [this._currentTrip.confidence, this._currentTrip.confidenceReason] = this.getTripScore();
  }

  private getTripScore(): [ConfidenceScore, string] {
    if (this._currentTrip.distanceMeters < tripParserConfig.distanceLowerLimitInMeter) {
      return [ConfidenceScore.Low, 'DistanceLesserThanLimit'];
    }

    if (this._currentTrip.distanceMeters > tripParserConfig.distanceUpperLimitInMeter) {
      return [ConfidenceScore.Low, 'DistanceGreaterThanLimit'];
    }

    if (this._currentTrip.totalDurationSeconds < tripParserConfig.durationLowerLimitInSeconds) {
      return [ConfidenceScore.Low, 'DurationShorterThanLimit'];
    }

    if (this._currentTrip.totalDurationSeconds > tripParserConfig.durationUpperLimitInSeconds) {
      return [ConfidenceScore.Low, 'DurationLongerThanLimit'];
    }

    const averageSpeed = this._currentTrip.distanceMeters / this._currentTrip.totalDurationSeconds;
    if (averageSpeed < tripParserConfig.averageSpeedLowerLimitInMps) {
      return [ConfidenceScore.Low, 'AverageSpeedSlowerThanLimit'];
    }

    if (averageSpeed > tripParserConfig.averageSpeedUpperLimitInMps) {
      return [ConfidenceScore.Low, 'AverageSpeedFasterThanLimit'];
    }

    if (this._currentTrip.confidence) return [this._currentTrip.confidence, this._currentTrip.confidenceReason];

    const idlePercentage = (this._currentTrip.idleDurationSeconds / this._currentTrip.totalDurationSeconds) * 100;
    if (idlePercentage < 15) return [ConfidenceScore.High, null];

    if (idlePercentage < 30) return [ConfidenceScore.Medium, 'IdlePercentageBetween15And30'];

    return [ConfidenceScore.Medium, 'IdlePercentageGreaterThan30'];
  }
}

function getDistanceInMeters(positions: number[][]) {
  if (positions.length < 2) return 0;

  const line = turf.lineString(positions);
  return turfLength.default(line, { units: 'meters' });
}

function validateDuration(trip: TripModel, durationSeconds: number) {
  if (durationSeconds > 60) {
    trip.confidence = ConfidenceScore.Medium;
    trip.confidenceReason = 'PositionsAreMissing';
  }
}

function validateSpeed(trip: TripModel, durationSeconds: number, distanceMeters: number) {
  // Speed limit to 360 km/h due to accomodate some tolerance on the position accuracy
  if (distanceMeters / durationSeconds > 100) {
    trip.confidence = ConfidenceScore.Medium;
    trip.confidenceReason = 'PositionsCantBeTrusted';
  }
}

function asMultiPoint(start: ICoordinates, end: ICoordinates): string {
  return `MULTIPOINT ( (${start.lon} ${start.lat}), (${end.lon} ${end.lat}) )`;
}

function asLineString(positions: number[][]): string {
  if (positions.length === 0) return '';
  if (positions.length === 1) return `POINT (${positions[0][0]} ${positions[0][1]})`;

  const flatPositions = positions.map(p => `${p[0]} ${p[1]}`).join(',');
  return `LINESTRING ( ${flatPositions} )`;
}

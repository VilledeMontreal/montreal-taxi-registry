// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import superagent = require('superagent');
import { configs } from '../../config/configs';
import { addMinutes } from '../shared/dateUtils/dateUtils';
import { taxiEstimatePostgrePool } from '../shared/taxiEstimate/taxiEstimatePostgre';
import { TaxiPositionSnapshotRequestDto } from '../taxiPositionSnapshot/taxiPositionSnapshotRequest.dto';
import { deleteRealTrips, insertRealTrips } from '../tripEstimates/tripEstimate.constants';
import { TripBuilder } from '../trips/trip.builder';
import { TripExtractionBase } from '../trips/trip.extractionBase';
import { TripModel } from '../trips/trip.model';
import { tripEstimateMapper } from './tripEstimate.mapper';

const taxiPositionsPath = '/api/data-dumps/taxi-positions';

class TripEstimateExtractionStrategy extends TripExtractionBase {
  private _sampleId: number;
  private _nextBatchDate: string;
  public async parseTaxiPositionSnapshots(tripBuilder: TripBuilder, from: string, to: string): Promise<void> {
    let time = from;
    do {
      time = addMinutes(time, 10);
      const snapshots = await fetchTaxiPositions(time);
      snapshots.forEach(snapshot => tripBuilder.parseTaxiPositionSnapshot(snapshot));
    } while (time < to);
  }

  public async persistNextBatchDate(date: string): Promise<void> {
    this._nextBatchDate = date;
    return null;
  }

  public async deleteBatch(date: string): Promise<void> {
    await taxiEstimatePostgrePool.query(deleteRealTrips, [
      this._sampleId,
      this.getBatchFrom(date),
      this.getBatchTo(date)
    ]);
  }

  public async saveBatch(trips: TripModel[]): Promise<void> {
    if (trips.length) {
      await taxiEstimatePostgrePool.query(insertRealTrips, [
        JSON.stringify(tripEstimateMapper.toTaxiEstimatePersistanceArray(this._sampleId, trips))
      ]);
    }
  }

  public setSampleId(sampleId: number) {
    this._sampleId = sampleId;
  }

  public getResumeDate() {
    return this._nextBatchDate;
  }
}

async function fetchTaxiPositions(date: string): Promise<TaxiPositionSnapshotRequestDto[]> {
  const host = configs.dataSources.taxiEstimate.host;
  const apikey = configs.dataSources.taxiEstimate.apikey;
  const url = `${host}${taxiPositionsPath}/${date}`;
  const response = await superagent
    .get(url)
    .set('X-API-KEY', apikey)
    .set('Accept-Encoding', 'GZIP');
  const snapshots = response.body.items.map(item =>
    toTaxiPositionSnapshotRequest(item)
  ) as TaxiPositionSnapshotRequestDto[];
  return snapshots.sort(sortByDateFunc());
}

function toTaxiPositionSnapshotRequest(item: any): TaxiPositionSnapshotRequestDto {
  item.receivedAt = new Date(item.receivedAt);
  return item;
}

function sortByDateFunc() {
  return (a, b) => (a.receivedAt < b.receivedAt ? -1 : a.receivedAt > b.receivedAt ? 1 : 0);
}

export const tripEstimateExtractionStrategy = new TripEstimateExtractionStrategy();

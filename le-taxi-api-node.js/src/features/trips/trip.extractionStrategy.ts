// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { nowUtcIsoString } from '../shared/dateUtils/dateUtils';
import { getMongoDb } from '../shared/taxiMongo/taxiMongo';
import { postgrePool } from '../shared/taxiPostgre/taxiPostgre';
import { TaxiPositionSnapshotRequestDto } from '../taxiPositionSnapshot/taxiPositionSnapshotRequest.dto';
import { TripBuilder } from './trip.builder';
import { deleteTrips, insertTrips, readBatchDate, updateBatchDate } from './trip.constants';
import { TripExtractionBase } from './trip.extractionBase';
import { tripMapper } from './trip.mapper';
import { TripModel } from './trip.model';

class TripExtractionStrategy extends TripExtractionBase {
  public async parseTaxiPositionSnapshots(tripBuilder: TripBuilder, from: string, to: string): Promise<void> {
    const mongoDb = getMongoDb();
    const cursor = mongoDb
      .collection<TaxiPositionSnapshotRequestDto>('taxiPositionSnapshots')
      .find({ receivedAt: { $gte: new Date(from), $lte: new Date(to) } })
      .sort({ receivedAt: 1 }); // Collection MUST have an index on the field receivedAt
    await cursor.forEach(taxiPositionSnapshot => tripBuilder.parseTaxiPositionSnapshot(taxiPositionSnapshot));
  }

  public async persistNextBatchDate(date): Promise<void> {
    await postgrePool.query(updateBatchDate, [date]);
  }

  public async deleteBatch(date: string): Promise<void> {
    await postgrePool.query(deleteTrips, [this.getBatchFrom(date), this.getBatchTo(date)]);
  }

  public async saveBatch(trips: TripModel[]): Promise<void> {
    if (trips.length) await postgrePool.query(insertTrips, [JSON.stringify(tripMapper.toPersistanceArray(trips))]);
  }

  public async extractAndAnonymize(): Promise<void> {
    const nextBatchDate = await readNextBatchDate();
    await this.extract(nextBatchDate, nowUtcIsoString());
  }
}

async function readNextBatchDate(): Promise<string> {
  const res = await postgrePool.query(readBatchDate);
  if (!res.rows || !res.rows[0]) throw new Error('Unable to read batch_date to extract taxi trips');
  return res.rows[0].batch_date;
}

export const tripExtractionStrategy = new TripExtractionStrategy();

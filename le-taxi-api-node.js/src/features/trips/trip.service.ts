// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { nowUtcIsoString } from '../shared/dateUtils/dateUtils';
import { postgrePool } from '../shared/taxiPostgre/taxiPostgre';
import { readBatchDate } from './trip.constants';
import { tripExtractionStrategy } from './trip.extractionStrategy';

class TripService {
  public async extractAndAnonymize(): Promise<void> {
    const nextBatchDate = await getResumeBatchDate();
    await tripExtractionStrategy.extract(nextBatchDate, nowUtcIsoString());
  }
}

async function getResumeBatchDate(): Promise<string> {
  const res = await postgrePool.query(readBatchDate);
  if (!res.rows || !res.rows[0]) throw new Error('Unable to read batch_date to extract taxi trips');
  return res.rows[0].batch_date;
}

export const tripService = new TripService();

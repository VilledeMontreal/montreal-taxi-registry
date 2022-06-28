// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import pgQueryStream = require('pg-query-stream');
import { hailDataDumpPeriodMilliseconds } from '../hails/hailConfig';
import { postgrePool } from '../shared/taxiPostgre/taxiPostgre';
import { selectInPeriod } from './hailDataDumps.constants';

class HailDataDumpsAccessLayer {
  public async getStream(timeSlot: string): Promise<any> {
    const dateStart = new Date(timeSlot);
    const dateEnd = new Date();
    dateEnd.setTime(dateStart.getTime() + hailDataDumpPeriodMilliseconds);
    const range = [dateStart.toISOString(), dateEnd.toISOString()];

    const client = await postgrePool.connect();
    const queryStream = new pgQueryStream(selectInPeriod, range);
    const stream = client.query(queryStream);
    stream.on('end', () => client.release());

    return stream;
  }
}

export const hailDataDumpsAccessLayer = new HailDataDumpsAccessLayer();

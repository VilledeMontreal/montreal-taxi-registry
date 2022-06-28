// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Transform } from 'stream';
import { HailModel } from '../hails/hail.model';
import { mapQueryResultToHailModel } from '../hails/hail.queryResultsMapper';
import { toHailDataDump } from './hailDataDumps.mapper';

export function formatHailDataDumpTransform() {
  return new Transform({
    objectMode: true,
    transform(data, encoding, callback) {
      try {
        const hailResponse = mapQueryResultToHailModel(data);
        const hailModel: HailModel = Object.assign(new HailModel(), hailResponse);
        const hailDataDump = toHailDataDump(hailModel);
        callback(null, hailDataDump);
      } catch (err) {
        callback(err);
      }
    }
  });
}

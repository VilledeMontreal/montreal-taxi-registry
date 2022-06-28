// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { getMongoDb } from '../shared/taxiMongo/taxiMongo';

class TaxiPositionSnapshotDataDumpsAccessLayer {
  public getStream(startDate: Date, endDate: Date): NodeJS.ReadableStream {
    const mongoDb = getMongoDb();
    return mongoDb
      .collection('taxiPositionSnapshots')
      .find({ receivedAt: { $gte: startDate, $lt: endDate } })
      .stream() as NodeJS.ReadableStream;
  }
}

export const taxiPositionSnapshotDataDumpsAccessLayer = new TaxiPositionSnapshotDataDumpsAccessLayer();

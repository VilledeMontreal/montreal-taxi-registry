// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { ICoordinates } from '../shared/coordinates/coordinates';
import { getMongoDb } from '../shared/taxiMongo/taxiMongo';
import { TaxiStatus } from './../../libs/taxiStatus';
import { latestTaxiPositionMapper } from './latestTaxiPosition.mapper';
import { LatestTaxiPositionModel } from './latestTaxiPosition.model';

class LatestTaxiPositionRepository {
  public async findLatestTaxiPosition(
    coordinate: ICoordinates,
    isMpv: boolean,
    isSpecialNeedVehicle: boolean,
    operators: number[] = null
  ): Promise<LatestTaxiPositionModel> {
    const db = getMongoDb();

    const filter = {
      status: TaxiStatus.Free,
      isPromoted: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [coordinate.lon, coordinate.lat] }
        }
      },
      ...operatorsCondition(operators),
      ...transportationTypeCondition(isMpv, isSpecialNeedVehicle)
    };

    const latestTaxiPosition = await db.collection('latestTaxiPositions').findOne(filter);
    return latestTaxiPositionMapper.mongoToLatestTaxiPositionModel(latestTaxiPosition);
  }

  public async getLatestTaxiPositionByTaxiId(id: string): Promise<LatestTaxiPositionModel> {
    const db = getMongoDb();
    const result = await db.collection('latestTaxiPositions').findOne({ _id: id });
    return latestTaxiPositionMapper.mongoToLatestTaxiPositionModel(result);
  }

  public async getLatestTaxiPositions(): Promise<LatestTaxiPositionModel[]> {
    const mongoDb = getMongoDb();
    const results = await mongoDb
      .collection('latestTaxiPositions')
      .find({})
      .toArray();
    return results.map(result => latestTaxiPositionMapper.mongoToLatestTaxiPositionModel(result));
  }

  public async saveLatestTaxiPositions(latestTaxiPositions: LatestTaxiPositionModel[]): Promise<void> {
    if (latestTaxiPositions.length === 0) return;

    const db = getMongoDb();
    const bulk = await db.collection('latestTaxiPositions').initializeUnorderedBulkOp();
    for (const pos of latestTaxiPositions) {
      const { lat, lon, taxiId, status, ...doc } = pos;
      if (status === TaxiStatus.Off) {
        bulk.find({ _id: taxiId }).deleteOne();
      } else {
        bulk
          .find({ _id: taxiId })
          .upsert()
          .replaceOne({
            location: {
              type: 'Point',
              coordinates: [lon, lat]
            },
            _id: taxiId,
            status,
            ...doc
          });
      }
    }
    await bulk.execute();
  }
}

function operatorsCondition(operators: number[]): any {
  return operators && operators.length > 0 ? { 'taxi.operatorId': { $in: operators } } : {};
}

function transportationTypeCondition(isMpv: boolean, isSpecialNeedVehicle: boolean): any {
  if (isMpv) {
    return {
      'taxi.isMpv': true,
      'taxi.isSpecialNeedVehicle': false
    };
  }

  if (isSpecialNeedVehicle) {
    return { 'taxi.isSpecialNeedVehicle': true };
  }

  return { 'taxi.isSpecialNeedVehicle': false };
}

export const latestTaxiPositionRepository = new LatestTaxiPositionRepository();

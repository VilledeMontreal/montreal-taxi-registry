// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { AssetTypes } from '../inquiry/inquiry.dto';
import { ICoordinates } from '../shared/coordinates/coordinates';
import { getMongoDb } from '../shared/taxiMongo/taxiMongo';
import { TaxiStatus } from './../../libs/taxiStatus';
import { latestTaxiPositionMapper } from './latestTaxiPosition.mapper';
import { LatestTaxiPositionModel } from './latestTaxiPosition.model';

class LatestTaxiPositionRepository {
  public async findLatestTaxiPosition(
    coordinate: ICoordinates,
    assetTypes: AssetTypes[],
    operators: number[] = null
  ): Promise<LatestTaxiPositionModel[]> {
    const db = getMongoDb();

    const aggregate = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [coordinate.lon, coordinate.lat]
          },
          spherical: true,
          distanceField: 'distance'
        }
      },
      {
        $facet: assetTypes.reduce((map, key) => {
          map[key] = [
            {
              $match: {
                status: TaxiStatus.Free,
                isPromoted: true,
                ...operatorsCondition(operators),
                ...transportationTypeCondition(key)
              }
            },
            {
              $addFields: {
                'taxi.assetType': key
              }
            },
            {
              $limit: 1
            }
          ];
          return map;
        }, {})
      }
    ];

    const results = await db
      .collection('latestTaxiPositions')
      .aggregate(aggregate)
      .toArray();
    return Object.values(results[0])
      .filter(result => result.length)
      .map(result => latestTaxiPositionMapper.mongoToLatestTaxiPositionModel(result[0]));
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

function transportationTypeCondition(assetType: AssetTypes): any {
  switch (assetType) {
    case AssetTypes.Mpv:
      return {
        'taxi.isMpv': true,
        'taxi.isSpecialNeedVehicle': false
      };
    case AssetTypes.SpecialNeed:
      return { 'taxi.isSpecialNeedVehicle': true };
    default:
    case AssetTypes.Normal:
      return { 'taxi.isSpecialNeedVehicle': false };
  }
}

export const latestTaxiPositionRepository = new LatestTaxiPositionRepository();

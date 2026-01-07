// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { ObjectId } from "mongodb";
import { configs } from "../../config/configs";
import { InquiryTypes } from "../inquiry/inquiry.dto";
import { ICoordinates } from "../shared/coordinates/coordinates";
import { getMongoDb } from "../shared/taxiMongo/taxiMongo";
import { TaxiStatus } from "./../../libs/taxiStatus";
import { latestTaxiPositionMapper } from "./latestTaxiPosition.mapper";
import {
  LatestTaxiPositionModel,
  LatestTaxiPositionModelExtended,
} from "./latestTaxiPosition.model";

class LatestTaxiPositionRepository {
  public async findClosestTaxis(
    coordinate: ICoordinates,
    inquiryTypes: InquiryTypes[],
    operators: number[] = null,
  ): Promise<LatestTaxiPositionModelExtended[]> {
    const db = getMongoDb();

    const filters = inquiryTypes.map((inquiryType) => ({
      isPromoted: true,
      status: TaxiStatus.Free,
      ...operatorsCondition(operators),
      ...transportationTypeCondition(inquiryType),
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [coordinate.lon, coordinate.lat],
          },
          $maxDistance: getArbitraryMaxDistance(inquiryType),
        },
      },
    }));

    const results = await Promise.all(
      filters.map((filter) =>
        db.collection("latestTaxiPositions").findOne(filter),
      ),
    );

    return results
      .map((result, i) =>
        latestTaxiPositionMapper.mongoToLatestTaxiPositionModelExtended(
          result,
          inquiryTypes[i],
        ),
      )
      .filter((result) => !!result);
  }

  public async getLatestTaxiPositionByTaxiId(
    id: string,
  ): Promise<LatestTaxiPositionModel> {
    const db = getMongoDb();
    const result = await db
      .collection("latestTaxiPositions")
      .findOne({ _id: id as unknown as ObjectId });
    return latestTaxiPositionMapper.mongoToLatestTaxiPositionModel(result);
  }

  public async getLatestTaxiPositions(): Promise<LatestTaxiPositionModel[]> {
    const mongoDb = getMongoDb();
    const results = await mongoDb
      .collection("latestTaxiPositions")
      .find({})
      .toArray();
    return results.map((result) =>
      latestTaxiPositionMapper.mongoToLatestTaxiPositionModel(result),
    );
  }

  public async saveLatestTaxiPositions(
    latestTaxiPositions: LatestTaxiPositionModel[],
  ): Promise<void> {
    if (latestTaxiPositions.length === 0) return;

    const db = getMongoDb();
    const bulk = db
      .collection("latestTaxiPositions")
      .initializeUnorderedBulkOp();
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
              type: "Point",
              coordinates: [lon, lat],
            },
            _id: taxiId,
            status,
            ...doc,
          });
      }
    }
    await bulk.execute();
  }
}

function operatorsCondition(operators: number[]): any {
  return operators && operators.length > 0
    ? { "taxi.operatorId": { $in: operators } }
    : {};
}

function transportationTypeCondition(inquiryTypes: InquiryTypes): any {
  switch (inquiryTypes) {
    case InquiryTypes.Minivan:
      return {
        "taxi.isMpv": true,
        "taxi.isSpecialNeedVehicle": false,
      };
    case InquiryTypes.SpecialNeed:
      return { "taxi.isSpecialNeedVehicle": true };
    default:
    case InquiryTypes.Standard:
      return { "taxi.isSpecialNeedVehicle": false };
  }
}

function getArbitraryMaxDistance(inquiryType: InquiryTypes): number {
  switch (inquiryType) {
    case InquiryTypes.SpecialNeed:
      return configs.inquiries.searchDistance.specialNeed;
    case InquiryTypes.Minivan:
      return configs.inquiries.searchDistance.minivan;
    default:
    case InquiryTypes.Standard:
      return configs.inquiries.searchDistance.standard;
  }
}

export const latestTaxiPositionRepository = new LatestTaxiPositionRepository();

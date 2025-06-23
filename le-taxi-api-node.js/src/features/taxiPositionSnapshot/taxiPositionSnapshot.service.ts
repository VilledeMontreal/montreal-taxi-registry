// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as moment from "moment";
import { latestTaxiPositionMapper } from "../latestTaxiPositions/latestTaxiPosition.mapper";
import { latestTaxiPositionRepository } from "../latestTaxiPositions/latestTaxiPosition.repository";
import * as mongoUtilities from "../shared/taxiMongo/taxiMongo";
import { taxiSummaryRepositoryWithCaching } from "../taxiSummaries/taxiSummary.repositoryWithCaching";
import { UserModel } from "../users/user.model";
import { TaxiStatus } from "./../../libs/taxiStatus";
import { TaxiPositionSnapshotRequestDto } from "./taxiPositionSnapshotRequest.dto";

class TaxiPositionSnapshotService {
  public async addTaxiPositionSnapshotInMongoDb(
    taxiPositionSnapshot: TaxiPositionSnapshotRequestDto,
    userModel: UserModel
  ): Promise<void> {
    taxiPositionSnapshot.receivedAt = moment.utc().toDate();
    taxiPositionSnapshot.items.forEach((item: any) => {
      item.timestampUTC = moment(item.timestamp, "X").toISOString();
      item.speed = item.speed.toString();
      item.azimuth = item.azimuth.toString();
      item.lat = item.lat.toString();
      item.lon = item.lon.toString();
      item.timestamp = item.timestamp.toString();
      item.version = item.version.toString();
    });
    await Promise.all([
      this.persistHistoryInMongoDb(taxiPositionSnapshot),
      this.persistIndexInMongoDb(taxiPositionSnapshot, userModel),
    ]);
  }

  private async persistIndexInMongoDb(
    taxiPositionSnapshot: TaxiPositionSnapshotRequestDto,
    userModel: UserModel
  ) {
    const taxiSummaryReferences =
      await taxiSummaryRepositoryWithCaching.getByKeys(
        taxiPositionSnapshot.items.map((item) => item.taxi)
      );
    const latestTaxiPosition =
      latestTaxiPositionMapper.toLatestTaxiPositionModels(
        taxiSummaryReferences,
        taxiPositionSnapshot,
        userModel
      );
    await latestTaxiPositionRepository.saveLatestTaxiPositions(
      latestTaxiPosition
    );
  }

  private async persistHistoryInMongoDb(
    taxiPositionSnapshot: TaxiPositionSnapshotRequestDto
  ): Promise<void> {
    const db = mongoUtilities.getMongoDb();

    const taxiPositionSnapshotToPersist: TaxiPositionSnapshotRequestDto = {
      items: taxiPositionSnapshot.items.filter(
        (snapshot) => snapshot.status !== TaxiStatus.Off
      ),
      receivedAt: taxiPositionSnapshot.receivedAt,
    };

    await db
      .collection("taxiPositionSnapshots")
      .insertOne(taxiPositionSnapshotToPersist);
  }
}

export const taxiPositionSnapshotService = new TaxiPositionSnapshotService();

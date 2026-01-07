// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import assert = require("assert");
import { TaxiPositionSnapshotItemRequestDto } from "../taxiPositionSnapshot/taxiPositionSnapshotItemRequest.dto";
import { TaxiPositionSnapshotRequestDto } from "../taxiPositionSnapshot/taxiPositionSnapshotRequest.dto";
import { TripModel } from "./trip.model";
import { TripParser } from "./trip.parser";

export class TripBuilder {
  private _tripParserByTaxiId: { [key: string]: TripParser } = {};

  public parseTaxiPositionSnapshot(
    taxiPositionSnapshot: TaxiPositionSnapshotRequestDto,
  ): void {
    taxiPositionSnapshot.items.forEach((taxiPosition) =>
      this.parseTaxiPosition(
        taxiPosition,
        taxiPositionSnapshot.receivedAt.toISOString(),
      ),
    );
  }

  public getCompletedTrips(): TripModel[] {
    // Important: Sorting by departure time (before saving) is critical to anonymise the taxi id;
    // otherwise it can be assumed that sequential trips belong to the same taxi.
    return Object.values(this._tripParserByTaxiId)
      .flatMap((taxiTripBuilder) => taxiTripBuilder.getCompletedTrips())
      .sort(
        (a, b) =>
          new Date(a.departureTime).getTime() -
          new Date(b.departureTime).getTime(),
      );
  }

  public deleteCompletedTrips(): void {
    Object.values(this._tripParserByTaxiId).forEach((tripBuilder) =>
      tripBuilder.deleteCompletedTrips(),
    );
  }

  private parseTaxiPosition(
    taxiPosition: TaxiPositionSnapshotItemRequestDto,
    receivedAt: string,
  ): void {
    if (!this._tripParserByTaxiId[taxiPosition.taxi]) {
      this._tripParserByTaxiId[taxiPosition.taxi] = new TripParser(
        taxiPosition.taxi,
      );
    }

    this._tripParserByTaxiId[taxiPosition.taxi].parseTaxiPosition(
      taxiPosition,
      receivedAt,
    );
  }
}

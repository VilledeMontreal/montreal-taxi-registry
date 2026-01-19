// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { addHours, addMS } from "../shared/dateUtils/dateUtils";
import { logger } from "../shared/logging/logger";
import { TripBuilder } from "./trip.builder";
import { TripModel } from "./trip.model";

export const batchDurationHours = 24;
export const tripMaxDurationHours = 12;

export interface IExtractTrips {
  parseTaxiPositionSnapshots(
    tripBuilder: TripBuilder,
    startDate: string,
    endDate: string,
  ): Promise<void>;
  deleteBatch(date: string): Promise<void>;
  saveBatch(trips: TripModel[]): Promise<void>;
  persistNextBatchDate(date: string): Promise<void>;
}

export abstract class TripExtractionBase implements IExtractTrips {
  abstract parseTaxiPositionSnapshots(
    tripBuilder: TripBuilder,
    startDate: string,
    endDate: string,
  ): Promise<void>;
  abstract deleteBatch(date: string): Promise<void>;
  abstract saveBatch(trips: TripModel[]): Promise<void>;
  abstract persistNextBatchDate(date: string): Promise<void>;

  public async extract(startDate: string, endDate: string): Promise<void> {
    let nextBatchDate = startDate;
    const tripBuilder = await this.initializeTripBuilder(nextBatchDate);

    while (nextBatchDate < endDate) {
      logger.info(`Trip extraction processing batch ${nextBatchDate}`);
      this.ignoreCompletedTripsFromPreviousBatch(tripBuilder);
      await this.parseBatch(tripBuilder, nextBatchDate);
      nextBatchDate = this.getNextBatchDate(nextBatchDate);
    }
  }

  private async initializeTripBuilder(date: string): Promise<TripBuilder> {
    logger.info(`Trip extraction warm-up`);
    const tripBuilder = new TripBuilder();
    await this.parseTaxiPositionSnapshots(
      tripBuilder,
      addHours(this.getBatchFrom(date), -tripMaxDurationHours),
      this.getBatchFrom(date),
    );
    return tripBuilder;
  }

  private async parseBatch(
    tripBuilder: TripBuilder,
    date: string,
  ): Promise<void> {
    await this.parseTaxiPositionSnapshots(
      tripBuilder,
      this.getBatchFrom(date),
      this.getBatchTo(date),
    );
    await this.deleteBatch(date); // delete allows for recovering from errors
    await this.saveBatch(tripBuilder.getCompletedTrips());

    await this.persistNextBatchDate(this.getNextBatchDate(date));
  }

  protected getNextBatchDate(date: string): string {
    // batches inclusively starts at 00:00:00.000Z and ends at 23:59:59.999Z
    // UTC time avoid days of 23h and 25h due to daylight saving
    return addHours(date, batchDurationHours);
  }

  protected getBatchFrom(date: string): string {
    return date; // inclusive boundary
  }

  protected getBatchTo(date: string): string {
    return addMS(this.getNextBatchDate(date), -1); // inclusive boundary
  }

  protected ignoreCompletedTripsFromPreviousBatch(
    tripBuilder: TripBuilder,
  ): void {
    tripBuilder.deleteCompletedTrips();
  }
}

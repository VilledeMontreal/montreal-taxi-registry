// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { tripEstimateExtractionStrategy } from "./tripEstimate.extractionStrategy";

class TripEstimateProcessor {
  public async process(
    sampleId: number,
    startDate: string,
    endDate: string,
  ): Promise<void> {
    tripEstimateExtractionStrategy.setSampleId(sampleId);
    await tripEstimateExtractionStrategy.extract(startDate, endDate);
  }

  public getResumeDate() {
    return tripEstimateExtractionStrategy.getResumeDate();
  }
}

export const tripEstimateProcessor = new TripEstimateProcessor();

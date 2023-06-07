// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { logger } from '../shared/logging/logger';
import { TimerAssert } from '../shared/timerAssert/timerAssert';
import { EstimationArguments, TestExecution, TestExecutionReport } from '../tripEstimates/tripEstimate.model';
import { taxiEstimateMapper } from './tripEstimateAccuracy.mapper';
import { taxiEstimateAccuracyRepository } from './tripEstimateAccuracy.repository';
import { estimateWithOsrm } from './tripEstimatesAccuracy.osrm';

const BATCH_SIZE = 200;

class TripEstimateAccuracyProcessor {
  public async process(estimationArguments: EstimationArguments): Promise<TestExecutionReport> {
    estimationArguments.testExecutionId = await taxiEstimateAccuracyRepository.insertTestExecution(estimationArguments);

    const realTripsCount = await this.estimateTaxiTrips(estimationArguments);

    const estimatedTripsCount = await taxiEstimateAccuracyRepository.getEstimatedTripsCount(
      estimationArguments.testExecutionId
    );
    logger.info(`Total estimated trips count inserted: ${estimatedTripsCount}`);

    const testExecution = taxiEstimateMapper.estimationArgumentToTestExecution(estimationArguments);

    return await this.generateTestExecutionReport(testExecution, realTripsCount, estimatedTripsCount - realTripsCount);
  }

  protected async estimateTaxiTrips({ testExecutionId, sampleId }: EstimationArguments): Promise<number> {
    const estimationCount = await taxiEstimateAccuracyRepository.getEstimatedTripsCount(testExecutionId);
    const realTripsCount = await taxiEstimateAccuracyRepository.getRealTripsCount(sampleId);

    const pages = Math.ceil((realTripsCount - estimationCount) / BATCH_SIZE);
    const timer = TimerAssert.startNew();

    for (let i = 0; i < pages; i++) {
      await this.processEstimatedTripsBatch(estimationCount + i * BATCH_SIZE, BATCH_SIZE, sampleId, testExecutionId);
    }
    timer.stop();

    logger.info(
      `Duration to process ${realTripsCount - estimationCount} realTrips: ${Math.trunc(timer.durationMs / 1000)} (sec)`
    );

    return realTripsCount;
  }

  protected async processEstimatedTripsBatch(
    offset: number,
    batchSize: number,
    sampleId: number,
    testExecutionId: number
  ): Promise<void> {
    const subRealTrips = await taxiEstimateAccuracyRepository.getRealTripsBatch(sampleId, offset, batchSize);

    const estimatedTripPromises = subRealTrips.map(realTrip => estimateWithOsrm(realTrip, testExecutionId));
    const estimatedTripPromisesWithTimeout = this.wrapWithTimeout(estimatedTripPromises, 10000);

    const estimatedTripsBatch = await Promise.all(estimatedTripPromisesWithTimeout);

    await taxiEstimateAccuracyRepository.insertEstimatedTrips(estimatedTripsBatch);

    logger.info(
      `Test execution id: ${testExecutionId} processed batch [${estimatedTripsBatch[0].real_trip_id}, ${
        estimatedTripsBatch[estimatedTripsBatch.length - 1].real_trip_id
      }] real_trip_id.`
    );
  }

  private wrapWithTimeout<T>(promises: Promise<T>[], timeoutInMs: number): Promise<T>[] {
    return promises.map(promise => {
      const waitForSeconds = new Promise<T>((resolve, reject) => {
        setTimeout(() => {
          reject('Timeout exceeded');
        }, timeoutInMs);
      });

      // basically creating a situation where there'll be a race between them
      return Promise.race([promise, waitForSeconds]);
    });
  }

  protected async generateTestExecutionReport(
    testExecution: TestExecution,
    realTripsCount: number,
    errorCount: number
  ): Promise<TestExecutionReport> {
    const testExecutionReport = await taxiEstimateAccuracyRepository.getTestExecutionReport(
      testExecution,
      realTripsCount,
      errorCount
    );

    return await taxiEstimateAccuracyRepository.insertTestExecutionReport(testExecutionReport);
  }
}

export const tripEstimateAccuracyProcessor = new TripEstimateAccuracyProcessor();

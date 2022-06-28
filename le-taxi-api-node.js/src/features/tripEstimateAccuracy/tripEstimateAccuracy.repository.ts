// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { taxiEstimatePostgrePool } from '../shared/taxiEstimate/taxiEstimatePostgre';
import {
  EstimatedTrip,
  EstimationArguments,
  RealTrip,
  TestExecution,
  TestExecutionReport
} from '../tripEstimates/tripEstimate.model';
import {
  countDistinctRealTripIdByTestExecutionId,
  countRealTrips,
  insertEstimatedTrips,
  insertTestExecution,
  insertTestExecutionReport,
  selectInsertedTestExecution,
  selectTestExecutionReport
} from './tripEstimateAccuracy.constants';

class TaxiEstimateAccuracyRepository {
  public async insertTestExecution({
    testExecutionId,
    sampleId,
    estimatedWith,
    createdBy
  }: EstimationArguments): Promise<number> {
    try {
      const responsePersistedTestExecution = await taxiEstimatePostgrePool.query(selectInsertedTestExecution, [
        testExecutionId
      ]);

      if (responsePersistedTestExecution?.rows?.length > 0) {
        return responsePersistedTestExecution.rows[0].id;
      }
    } catch (error) {
      throw new Error(
        `Error selecting id: ${testExecutionId} from table test_executions in database taxiestimate, error: ${error}`
      );
    }

    try {
      const createdAt = new Date();
      const responseInsertedTestExecution = await taxiEstimatePostgrePool.query(insertTestExecution, [
        sampleId,
        estimatedWith,
        createdAt,
        createdBy
      ]);
      handleEmptyResponse(responseInsertedTestExecution);

      return (responseInsertedTestExecution.rows[0] as any).id;
    } catch (error) {
      throw new Error(`Error inserting test execution into database taxiestimate, error: ${error}`);
    }
  }

  public async insertEstimatedTrips(estimatedTrips: EstimatedTrip[]): Promise<void> {
    try {
      const estimatedTripsId = estimatedTrips.map(({ real_trip_id }) => real_trip_id);
      const deleteInsertedEstimatedTrips = `DELETE FROM taxiestimate.estimated_trips WHERE id IN (${estimatedTripsId})`;

      await taxiEstimatePostgrePool.query(deleteInsertedEstimatedTrips);
      await taxiEstimatePostgrePool.query(insertEstimatedTrips, [JSON.stringify(estimatedTrips)]);
    } catch (error) {
      throw new Error(`Error inserting estimated trips into database taxiestimate, error: ${error}`);
    }
  }

  public async insertTestExecutionReport(testExecutionReport: TestExecutionReport): Promise<TestExecutionReport> {
    try {
      const response = await taxiEstimatePostgrePool.query(insertTestExecutionReport, [
        JSON.stringify([testExecutionReport])
      ]);
      handleEmptyResponse(response);

      return response.rows[0];
    } catch (error) {
      throw new Error(`Error inserting test execution report into database taxiestimate, error: ${error}`);
    }
  }

  public async getEstimatedTripsCount(testExecutionId: number): Promise<number> {
    try {
      const response = await taxiEstimatePostgrePool.query(countDistinctRealTripIdByTestExecutionId, [testExecutionId]);
      handleEmptyResponse(response);

      return +response.rows[0].count;
    } catch (error) {
      throw new Error(`Error getting estimated trips count from database taxiestimate, error: ${error}`);
    }
  }

  public async getRealTripsBatch(sampleId: number, offset: number, limit: number): Promise<RealTrip[]> {
    try {
      const selectRealTrips = `SELECT * FROM taxiestimate.real_trips rt where sample_id = $1::int ORDER BY id OFFSET $2::int LIMIT $3::int;`;

      const response = await taxiEstimatePostgrePool.query(selectRealTrips, [sampleId, offset, limit]);
      handleEmptyResponse(response);

      return response.rows;
    } catch (error) {
      throw new Error(`Error getting real trips batch from database taxiestimate, error: ${error}`);
    }
  }

  public async getTestExecutionReport(
    { id, sample_id, created_at, created_by, estimated_with }: TestExecution,
    allTripCount: number,
    errorCount: number
  ): Promise<TestExecutionReport> {
    const testExecutionReport: Partial<TestExecutionReport> = {
      test_execution_id: id,
      sample_id,
      estimated_with,
      created_at,
      created_by,
      all_trip_count: allTripCount,
      error_count: errorCount
    };
    try {
      const results = await Promise.all(
        selectTestExecutionReport.map(({ query }) => taxiEstimatePostgrePool.query(query, [id]))
      );
      results.forEach(({ rows: [row] }) => this.assignRowToTestExecutionReport(row, testExecutionReport));

      return testExecutionReport as TestExecutionReport;
    } catch (error) {
      throw new Error(`Error getting test execution report statistics from database taxiestimate, error: ${error}`);
    }
  }

  private assignRowToTestExecutionReport(row: any, testExecutionReport: Partial<TestExecutionReport>) {
    const [[key, value]] = Object.entries(row);
    testExecutionReport[`${key}`] = Number(value);
  }

  public async getRealTripsCount(sampleId: number): Promise<number> {
    try {
      const response = await taxiEstimatePostgrePool.query(countRealTrips, [sampleId]);
      handleEmptyResponse(response);

      return +response.rows[0].count;
    } catch (error) {
      throw new Error(`Error getting real trips count from database taxiestimate, error: ${error}`);
    }
  }
}

export const taxiEstimateAccuracyRepository = new TaxiEstimateAccuracyRepository();

function handleEmptyResponse(response: any): void {
  if (!response?.rows || !response?.rows[0]) {
    throw new Error('Error reading response from database taxiestimate');
  }
}

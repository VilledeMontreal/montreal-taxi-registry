// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { EstimationArguments, TestExecution } from '../tripEstimates/tripEstimate.model';

class TaxiEstimateMapper {
  public estimationArgumentToTestExecution({
    createdBy,
    estimatedWith,
    sampleId,
    testExecutionId
  }: EstimationArguments): TestExecution {
    return {
      id: testExecutionId,
      sample_id: sampleId,
      estimated_with: estimatedWith,
      created_at: new Date(),
      created_by: createdBy
    };
  }
}

export const taxiEstimateMapper = new TaxiEstimateMapper();

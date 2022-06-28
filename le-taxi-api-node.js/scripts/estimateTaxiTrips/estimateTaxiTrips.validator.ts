// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { isPositive } from 'class-validator';
import { isInteger, isString } from 'lodash';
import { EstimationArguments } from '../../src/features/tripEstimates/tripEstimate.model';
import { ROUTE_ESTIMATION_SOLUTIONS } from './estimateTaxiTrips.script';

export function validateEstimationArguments({
  sampleId,
  createdBy,
  estimatedWith,
  testExecutionId
}: any): EstimationArguments {
  if (!(isInteger(sampleId) && isPositive(sampleId))) {
    throw new Error(`sampleId must be a valid positive integer`);
  }

  if (!ROUTE_ESTIMATION_SOLUTIONS.some(estimation => estimatedWith === estimation)) {
    throw new Error(
      `estimatedWith can only use a valid estimation solution like: ${[
        ...ROUTE_ESTIMATION_SOLUTIONS
      ]}, ${estimatedWith} is a invalid input`
    );
  }

  if (!isString(createdBy)) {
    throw new Error('createdBy must be a valid string representing the author of the estimation');
  }

  return { sampleId, createdBy, estimatedWith, testExecutionId };
}

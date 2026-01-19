// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { CaporalValidator, Command } from "@villedemontreal/caporal";
import { ScriptBase } from "@villedemontreal/scripting/dist/src/scriptBase";
import { tripEstimateAccuracyProcessor } from "../../src/features/tripEstimateAccuracy/tripEstimateAccuracy.processor";
import { EstimationArguments } from "../../src/features/tripEstimates/tripEstimate.model";
import { validateEstimationArguments } from "./estimateTaxiTrips.validator";

export const ROUTE_ESTIMATION_SOLUTIONS = ["le-taxi-osrm"];
export class EstimateTaxiTripsScript extends ScriptBase<EstimationArguments> {
  get name(): string {
    return "estimate-taxi-trips";
  }

  get description(): string {
    return `Launch script estimate-taxi-trips
    Ex: ./run estimate-taxi-trips 1 le-taxi-osrm author
    `;
  }

  protected async configure(command: Command): Promise<void> {
    command
      .argument("<sampleId>", "sampleId must be a valid positive integer", {
        default: 1,
        validator: CaporalValidator.NUMBER,
      })
      .argument(
        "<estimatedWith>",
        `estimatedWith can only use a valid estimation solution like: ${[
          ...ROUTE_ESTIMATION_SOLUTIONS,
        ]}`,
        {
          default: ROUTE_ESTIMATION_SOLUTIONS[0],
          validator: CaporalValidator.STRING,
        }
      )
      .argument(
        "<createdBy>",
        "createdBy must be a valid string representing the author of the estimation",
        {
          default: "author",
          validator: CaporalValidator.STRING,
        }
      )
      .argument(
        "[testExecutionId]",
        "testExecutionId must be a valid positive integer",
        {
          validator: CaporalValidator.NUMBER,
        }
      );
  }

  protected async main() {
    const estimationArguments = validateEstimationArguments(this.args);

    for (const key in estimationArguments) {
      this.logger.info(`${key}: ${estimationArguments[key]}`);
    }

    let errorCount = 0;
    while (errorCount !== -1 && errorCount < 5000) {
      try {
        this.logger.info("error count = " + errorCount);
        const testExecutionReport =
          await tripEstimateAccuracyProcessor.process(estimationArguments);

        this.logger.info("Test execution report have been generated.");
        for (const key in testExecutionReport) {
          this.logger.info(`${key}: ${testExecutionReport[key]}`);
        }
        errorCount = -1;
      } catch (error) {
        this.logger.error(
          `Error executing script estimate-taxi-trips: ${error}, ${this.buildResumeCommandLine(
            estimationArguments
          )}`
        );
        errorCount++;
      }
    }
  }

  protected buildResumeCommandLine({
    sampleId,
    createdBy,
    estimatedWith,
    testExecutionId,
  }: EstimationArguments): string {
    return `./run estimate-taxi-trips ${sampleId} ${estimatedWith} ${createdBy} ${testExecutionId}`;
  }
}

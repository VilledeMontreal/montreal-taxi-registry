// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { CaporalValidator, Command } from '@caporal/core';
import { ScriptBase } from '@villedemontreal/scripting/dist/src/scriptBase';
import { nowUtcIsoString } from '../../src/features/shared/dateUtils/dateUtils';
import { taxiEstimatePostgrePool } from '../../src/features/shared/taxiEstimate/taxiEstimatePostgre';
import { insertSample, selectSample, updateSample } from '../../src/features/tripEstimates/tripEstimate.constants';
import { tripEstimateProcessor } from '../../src/features/tripEstimates/tripEstimate.processor';
import { validateOptions } from './importTripSample.validator';

export interface Options {
  id: number;
  name: string;
  desc: string;
  createdBy: string;
  from: string;
  to: string;
}

export class ImportTripSampleScript extends ScriptBase<Options> {
  get name(): string {
    return 'import-trip-sample';
  }

  get description(): string {
    return `
Import the real trips into a new sample.

  ex: ./run import-trip-sample --id=123 --name="Test Sample" --desc="Sample description"  --createdBy="me" --from="2021-06-01" --to="2021-06-03"
`;
  }

  protected async configure(command: Command): Promise<void> {
    command.option(`--id <number>`, `The sample id to create`, {
      required: true,
      validator: CaporalValidator.NUMBER
    });
    command.option(`--name <string>`, `The name of the sample to create`, {
      required: true,
      validator: CaporalValidator.STRING
    });
    command.option(`--desc <string>`, `Optional - The description or purpose of the sample to create`, {
      validator: CaporalValidator.STRING
    });
    command.option(`--createdBy <string>`, `The person/entity creating the sample`, {
      required: true,
      validator: CaporalValidator.STRING
    });
    command.option(`--from <string>`, `The time to start the extraction in ISOString format`, {
      required: true,
      validator: CaporalValidator.STRING
    });
    command.option(`--to <string>`, `The time to end the extraction in ISOString format`, {
      required: true,
      validator: CaporalValidator.STRING
    });
  }

  protected async main() {
    const options = await validateOptions(this.options);
    this.logger.info(`Starting sample import: ${options.id} - ${options.name}`);

    const sampleId = await this.createSample(options);
    if (!sampleId) throw new Error(`Unable to create sample`);

    try {
      await tripEstimateProcessor.process(sampleId, options.from, options.to);
    } catch (err) {
      this.logger.error(`Trip processing failed. To resume, use: ${this.buildResumeCommandLine(options)}`);
      throw err;
    }

    this.logger.info(`Sample import finished: ${options.id} - ${options.name}`);
  }

  protected buildResumeCommandLine(opts: Partial<Options>) {
    const nextBatchDate = tripEstimateProcessor.getResumeDate();
    const date = nextBatchDate ?? opts.from;
    const options = Object.entries(opts)
      .map(([key, value]) => (key === 'from' ? `--from="${date}"` : `--${key}="${value}"`))
      .join(' ');
    return `./run ${this.name} ${options}`;
  }

  protected async createSample({ id, name, desc, createdBy }: Partial<Options>): Promise<number> {
    const select = await taxiEstimatePostgrePool.query(selectSample, [id]);

    if (select?.rows?.length > 0) {
      const update = await taxiEstimatePostgrePool.query(updateSample, [id, name, desc, nowUtcIsoString(), createdBy]);
      return update?.rows?.length > 0 ? update.rows[0].id : null;
    } else {
      const insert = await taxiEstimatePostgrePool.query(insertSample, [id, name, desc, nowUtcIsoString(), createdBy]);
      return insert?.rows?.length > 0 ? insert.rows[0].id : null;
    }
  }
}

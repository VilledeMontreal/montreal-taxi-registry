// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { CaporalValidator, Command } from '@caporal/core';
import { ScriptBase } from '@villedemontreal/scripting/dist/src/scriptBase';
import { taxiEstimatePostgrePool } from '../../src/features/shared/taxiEstimate/taxiEstimatePostgre';
import { clearMatches } from '../../src/features/tripEstimateMatch/tripEstimateMatch.constants';
import { tripMatchProcessor } from '../../src/features/tripEstimateMatch/tripEstimateMatch.processor';
import { validateOptions } from './matchTripSample.validator';

export interface MatchOptions {
  id: number;
  from: string;
  to: string;
}

export class MatchTripSampleScript extends ScriptBase<MatchOptions> {
  get name(): string {
    return 'match-trip-sample';
  }

  get description(): string {
    return `
Match taxiestimate.real_trips to vdm_txp.trips

  ex: ./run match-trip-sample --id=123 --from="2021-06-01" --to="2021-06-02"
`;
  }

  protected async configure(command: Command): Promise<void> {
    command.argument(`--id <number>`, `The sample id to work with`, {
      default: 1,
      validator: CaporalValidator.NUMBER
    });
    command.argument(`--from <string>`, `The time to start the extraction in ISOString format`, {
      default: '2021-06-01',
      validator: CaporalValidator.STRING
    });
    command.argument(`--to <string>`, `The time to end the extraction in ISOString format`, {
      default: '2021-06-02',
      validator: CaporalValidator.STRING
    });
  }

  protected async main() {
    const options = await validateOptions(this.args);
    this.logger.info(`Starting sample match: ${options.id}`);

    await this.clearMatches(options.id);

    await tripMatchProcessor.process(options.id, options.from, options.to);

    this.logger.info(`Sample match finished: ${options.id}`);
  }

  protected async clearMatches(id): Promise<void> {
    await taxiEstimatePostgrePool.query(clearMatches, [id]);
  }
}

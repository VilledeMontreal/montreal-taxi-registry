// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as config from 'config';

export interface IHailConfig {
  statuses: {
    emitted: IHailStatusConfig;
    received: IHailStatusConfig;

    sent_to_operator: IHailStatusConfig;

    received_by_operator: IHailStatusConfig;

    received_by_taxi: IHailStatusConfig;

    accepted_by_taxi: IHailStatusConfig;

    accepted_by_customer: IHailStatusConfig;

    customer_on_board: IHailStatusConfig;
  };
  dataDump: {
    dumpPeriodInMinutes: number;
  };
}

export interface IHailStatusConfig {
  timeoutInSec: number;
}

export const hailConfig: IHailConfig = config.get('hails');
export const hailDataDumpPeriodMilliseconds = hailConfig.dataDump.dumpPeriodInMinutes * 60 * 1000;

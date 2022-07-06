// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { isIsoDate } from '../../src/features/shared/dateUtils/dateUtils';
import { MatchOptions } from './matchTripSample.script';

export function validateOptions(opts: any): MatchOptions {
  if (!isIsoDate(opts.fromString) || !isIsoDate(opts.toString)) {
    throw new Error(`'from' and 'to' options should use yyyy-MM-dd format`);
  }

  if (opts.toString <= opts.fromString) throw new Error(`'from' date should be anterior to 'to' date`);

  return {
    id: opts.idNumber,
    from: toIsoString(opts.fromString),
    to: toIsoString(opts.toString)
  };
}

function toIsoString(isoDate: string) {
  return `${isoDate}T00:00:00.000Z`;
}

// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { isIsoDate } from '../../src/features/shared/dateUtils/dateUtils';
import { Options } from './importTripSample.script';

export function validateOptions(opts: any): Options {
  if (!isIsoDate(opts.from) || !isIsoDate(opts.to)) {
    throw new Error(`'from' and 'to' options should use yyyy-MM-dd format`);
  }

  if (opts.to <= opts.from) throw new Error(`'from' date should be anterior to 'to' date`);

  return {
    id: opts.id,
    name: opts.name,
    desc: opts.desc,
    createdBy: opts.createdBy,
    from: toIsoString(opts.from),
    to: toIsoString(opts.to)
  };
}

function toIsoString(isoDate: string) {
  return `${isoDate}T00:00:00.000Z`;
}

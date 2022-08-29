// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from 'express';
import { stringify } from 'JSONStream';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { validateEncoding } from '../shared/dataDumps/dataDumps.validators';
import { allow } from '../users/securityDecorator';
import { UserRole } from '../users/userRole';
import { hailDataDumpsAccessLayer } from './hailDataDumps.dal';
import { formatHailDataDumpTransform } from './hailDataDumps.transforms';
import { validateTimeSlot } from './hailDataDumps.validators';

const pipelineAsync = promisify(pipeline);

class HailDataDumpsController {
  @allow([UserRole.Admin, UserRole.Manager, UserRole.Stats])
  public async getHailDataDumps(request: Request, response: Response) {
    validateEncoding(request);
    const timeSlot = await validateTimeSlot(request);

    const stream = await hailDataDumpsAccessLayer.getStream(timeSlot);

    const open = `{ "data": [ {  "items": [`;
    const close = `] } ] }`;
    await pipelineAsync(stream, formatHailDataDumpTransform(), stringify(open, ',', close), response.type('json'));
  }
}

export const hailDataDumpsController = new HailDataDumpsController();

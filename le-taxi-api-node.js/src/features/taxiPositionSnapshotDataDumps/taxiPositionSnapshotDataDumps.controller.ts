// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from 'express';
import { validateEncoding } from '../shared/dataDumps/dataDumps.validators';
import { allow } from '../users/securityDecorator';
import { taxiPositionSnapshotDataDumpsAccessLayer } from './taxiPositionSnapshotDataDumps.dal';
import { validateSnapshotRange } from './taxiPositionSnapshotDataDumps.validators';

import { stringify } from 'JSONStream';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);

class TaxiPositionSnapshotDataDumpsController {
  @allow(['admin', 'gestion', 'stats'])
  public async getTaxiPositionSnapshotDataDumps(request: Request, response: Response) {
    validateEncoding(request);
    const dateRange = validateSnapshotRange(request);
    const stream = taxiPositionSnapshotDataDumpsAccessLayer.getStream(
      new Date(dateRange.startDate),
      new Date(dateRange.endDate)
    );

    const open = `{ "id": "${dateRange.endDate}", "items": [`;
    const close = `] }`;
    await pipelineAsync(stream, stringify(open, ',', close), response.type('json'));
  }
}

export const taxiPositionSnapshotDataDumpsController = new TaxiPositionSnapshotDataDumpsController();

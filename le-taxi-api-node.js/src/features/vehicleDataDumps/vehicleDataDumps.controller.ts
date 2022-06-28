// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from 'express';
import { stringify } from 'JSONStream';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { validateEncoding, validateEtag } from '../shared/dataDumps/dataDumps.validators';
import { generateEtag } from '../shared/eTags/eTagUtils';
import { allow } from '../users/securityDecorator';
import { vehicleDataDumpsAccessLayer } from './vehicleDataDumps.dal';

const pipelineAsync = promisify(pipeline);

class VehicleDataDumpsController {
  @allow(['admin', 'gestion', 'stats'])
  public async getVehicleDataDumps(request: Request, response: Response) {
    validateEncoding(request);

    const lastDate = await vehicleDataDumpsAccessLayer.getLastDate(request.query.operator as string);
    validateEtag(request, lastDate);

    const stream = await vehicleDataDumpsAccessLayer.getStream(request.query.operator as string);
    response.setHeader('etag', generateEtag(lastDate));

    await pipelineAsync(stream, stringify(), response.type('json'));
  }
}

export const vehicleDataDumpsController = new VehicleDataDumpsController();

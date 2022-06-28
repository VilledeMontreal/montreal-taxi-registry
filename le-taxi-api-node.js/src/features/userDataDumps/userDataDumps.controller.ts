// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from 'express';
import { validateEncoding } from '../shared/dataDumps/dataDumps.validators';
import { allow } from '../users/securityDecorator';
import { userDataDumpsAccessLayer } from './userDataDumps.dal';

import { stringify } from 'JSONStream';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);

class UserDataDumpsController {
  @allow(['admin', 'gestion', 'stats'])
  public async getUserDataDumps(request: Request, response: Response) {
    validateEncoding(request);

    const stream = await userDataDumpsAccessLayer.getStream();

    await pipelineAsync(stream, stringify(), response.type('json'));
  }
}

export const usersDataDumpController = new UserDataDumpsController();

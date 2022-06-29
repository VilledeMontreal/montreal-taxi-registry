// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from 'express';
import { stringify } from 'JSONStream';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { validateEncoding } from '../shared/dataDumps/dataDumps.validators';
import { allow } from '../users/securityDecorator';
import { UserRole } from '../users/userRole';
import { roleDataDumpsAccessLayer } from './roleDataDumps.dal';

const pipelineAsync = promisify(pipeline);

class RolesDataDumpController {
  @allow([UserRole.Admin, UserRole.Manager, UserRole.Stats])
  public async getRoleDataDumps(request: Request, response: Response) {
    validateEncoding(request);

    const stream = await roleDataDumpsAccessLayer.getStream();

    await pipelineAsync(stream, stringify(), response.type('json'));
  }
}

export const rolesDataDumpController = new RolesDataDumpController();

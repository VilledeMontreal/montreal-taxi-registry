// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { buildDataDumpStream } from '../shared/dataDumps/dataDumps';
import { selectAll } from './roleDataDumps.constants';

class RoleDataDumpsAccessLayer {
  public async getStream(): Promise<any> {
    return await buildDataDumpStream(selectAll);
  }
}

export const roleDataDumpsAccessLayer = new RoleDataDumpsAccessLayer();

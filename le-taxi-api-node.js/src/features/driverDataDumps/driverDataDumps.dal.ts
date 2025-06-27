// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import {
  buildDataDumpStream,
  getLastDate,
} from "../shared/dataDumps/dataDumps";
import {
  insertDateColumn,
  selectAll,
  tableName,
  updateDateColumn,
} from "./driverDataDumps.constants";

class DriverDataDumpsAccessLayer {
  public async getLastDate(operator: string) {
    return await getLastDate(
      tableName,
      insertDateColumn,
      updateDateColumn,
      operator
    );
  }

  public async getStream(operator: string): Promise<any> {
    return await buildDataDumpStream(selectAll, operator);
  }
}

export const driverDataDumpsAccessLayer = new DriverDataDumpsAccessLayer();

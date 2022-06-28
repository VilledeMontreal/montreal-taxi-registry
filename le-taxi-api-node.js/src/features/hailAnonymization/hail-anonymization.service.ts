// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { postgrePool } from '../shared/taxiPostgre/taxiPostgre';
import {
  anonymizeRecords,
  insertLastAnonymizationDate,
  readLastAnonymizationDate,
  updateLastAnonymizationDate
} from './hail-anonymization.constants';

class HailAnonymizeService {
  public async anonymize(): Promise<number> {
    const lastAnonymizationDate = await this.getLastAnonymizationDate();
    const nowUTC = new Date().toISOString();
    const res = await postgrePool.query(anonymizeRecords, [lastAnonymizationDate, nowUTC]);
    await this.updateLastAnonymizationDate(nowUTC);
    return res.rowCount;
  }

  private async getLastAnonymizationDate(): Promise<string> {
    let lastAnonymizationDate: string;
    const res = await postgrePool.query(readLastAnonymizationDate);
    if (!res.rows || !res.rows[0]) {
      lastAnonymizationDate = new Date('1990-01-01T00:00:00z').toISOString();
      await postgrePool.query(insertLastAnonymizationDate, [lastAnonymizationDate]);

      return lastAnonymizationDate;
    }

    return res.rows[0].last_processed_read_only_after;
  }

  private async updateLastAnonymizationDate(lastAnonymizationDate: string) {
    await postgrePool.query(updateLastAnonymizationDate, [lastAnonymizationDate]);
  }
}

export const hailAnonymizeService = new HailAnonymizeService();

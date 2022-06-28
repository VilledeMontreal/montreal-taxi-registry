// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { IHistoryItem } from '../hails/hail.dto';
import { HailModel } from '../hails/hail.model';
import { getCurrentStatus } from '../hails/statuses/hailStatuses';
import { nowUtcIsoString } from '../shared/dateUtils/dateUtils';
import { statusHistoryFields } from './hailDataDumps.constants';

export function toHailDataDump(element: HailModel) {
  return {
    id: element.id,
    search_engine_id: element.added_by,
    taxi_id: element.taxi_id,
    rating_ride: element.rating_ride,
    rating_ride_reason: element.rating_ride_reason,
    incident_taxi_reason: element.incident_taxi_reason,
    read_only_after: element.read_only_after,
    status_history: getHistorySorted(element)
  };
}

function getHistorySorted(dataRow: any): IHistoryItem[] {
  const dateStatusList = statusHistoryFields
    .filter(statusChange => dataRow[statusChange.change])
    .map(statusChange => [dataRow[statusChange.change], statusChange.status]);

  const utcNow = nowUtcIsoString();
  const currentStatus = getCurrentStatus(dataRow, utcNow);
  if (['timeout_taxi', 'failure', 'timeout_customer'].includes(currentStatus)) {
    dateStatusList.push([dataRow.read_only_after, currentStatus]);
  }

  return dateStatusList
    .map(element => ({
      timestampUTC: element[0],
      status: element[1]
    }))
    .sort((a, b) => new Date(a.timestampUTC).getTime() - new Date(b.timestampUTC).getTime());
}

// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as _ from 'lodash';
import { HailModel } from './hail.model';

function mapQueryResultToHailModel(hail: any): HailModel {
  const model = _.cloneDeep(hail);
  model.change_to_accepted_by_customer = hail.change_to_accepted_by_customer;
  model.change_to_accepted_by_taxi = hail.change_to_accepted_by_taxi;
  model.change_to_declined_by_customer = hail.change_to_declined_by_customer;
  model.change_to_declined_by_taxi = hail.change_to_declined_by_taxi;
  model.change_to_failure = hail.change_to_failure;
  model.change_to_incident_customer = hail.change_to_incident_customer;
  model.change_to_incident_taxi = hail.change_to_incident_taxi;
  model.change_to_received_by_operator = hail.change_to_received_by_operator;
  model.change_to_received_by_taxi = hail.change_to_received_by_taxi;
  model.change_to_sent_to_operator = hail.change_to_sent_to_operator;
  model.change_to_customer_on_board = hail.change_to_customer_on_board;
  model.change_to_finished = hail.change_to_finished;
  model.last_persisted_status_change = hail.last_persisted_status_change;
  model.creation_datetime = hail.creation_datetime;
  model.last_update_at = hail.last_update_at;
  model.read_only_after = hail.read_only_after;
  return model;
}

export { mapQueryResultToHailModel };

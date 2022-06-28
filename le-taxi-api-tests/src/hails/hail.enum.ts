// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export enum StatusHail {
  RECEIVED = 'received',
  SENT_TO_OPERATOR = 'sent_to_operator',
  RECEIVED_BY_TAXI = 'received_by_taxi',
  RECEIVED_BY_OPERATOR = 'received_by_operator',
  ACCEPTED_BY_TAXI = 'accepted_by_taxi',
  ACCEPTED_BY_CUSTOMER = 'accepted_by_customer',
  CUSTOMER_ON_BOARD = 'customer_on_board',
  FINISHED = 'finished',
  TIMEOUT_TAXI = 'timeout_taxi',
  TIMEOUT_CUSTOMER = 'timeout_customer',
  EMITTED = 'emitted',
  FAILURE = 'failure',
  INCIDENT_TAXI = 'incident_taxi',
  INCIDENT_CUSTOMER = 'incident_customer',
  DECLINED_BY_TAXI = 'declined_by_taxi',
  DECLINED_BY_CUSTOMER = 'declined_by_customer',
  INCIDENT_TAXI_REASON = 'incident_taxi_reason'
}

// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export enum HailActiveStatus {
  EMITTED = 'emitted',
  RECEIVED = 'received',
  SENT_TO_OPERATOR = 'sent_to_operator',
  RECEIVED_BY_OPERATOR = 'received_by_operator',
  RECEIVED_BY_TAXI = 'received_by_taxi',
  ACCEPTED_BY_TAXI = 'accepted_by_taxi',
  ACCEPTED_BY_CUSTOMER = 'accepted_by_customer',
  CUSTOMER_ON_BOARD = 'customer_on_board'
}

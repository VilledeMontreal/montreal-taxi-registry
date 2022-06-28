// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { BadRequestError } from '../../errorHandling/errors';
import { hailStatuses } from './hailStatuses';

export function ensureCanPerformTransition(currentStatusName: string, targetStatusName: string) {
  const fsm = createHailStatusFsm(currentStatusName);
  if (!fsm.can(targetStatusName)) {
    throw new BadRequestError(
      `${targetStatusName} status is not reachable from the current status: ${currentStatusName}`
    );
  }
}

// tslint:disable-next-line:variable-name
const StateMachine: any = require('javascript-state-machine');
const visualize = require('javascript-state-machine/lib/visualize');
// Here we use only a subset of javascript-state-machine.
// Defining the fsm and providing basics functions on that fsm is the best part of javascript-state-machine.
// For more details, see the documentation: https://github.com/jakesgordon/javascript-state-machine
function createHailStatusFsm(initialStatusName: string) {
  return new StateMachine({
    init: initialStatusName,
    transitions: [
      // We will use the convention that transition name is always the same as the target status.

      {
        name: hailStatuses.received.name,
        from: hailStatuses.emitted.name,
        to: hailStatuses.received.name
      },
      {
        name: hailStatuses.sent_to_operator.name,
        from: hailStatuses.received.name,
        to: hailStatuses.sent_to_operator.name
      },
      {
        name: hailStatuses.received_by_operator.name,
        from: hailStatuses.sent_to_operator.name,
        to: hailStatuses.received_by_operator.name
      },
      {
        name: hailStatuses.received_by_taxi.name,
        from: hailStatuses.received_by_operator.name,
        to: hailStatuses.received_by_taxi.name
      },
      {
        name: hailStatuses.declined_by_taxi.name,
        from: hailStatuses.received_by_taxi.name,
        to: hailStatuses.declined_by_taxi.name
      },
      {
        name: hailStatuses.timeout_taxi.name,
        from: hailStatuses.received_by_taxi.name,
        to: hailStatuses.timeout_taxi.name
      },
      {
        name: hailStatuses.accepted_by_taxi.name,
        from: hailStatuses.received_by_taxi.name,
        to: hailStatuses.accepted_by_taxi.name
      },
      {
        name: hailStatuses.timeout_customer.name,
        from: hailStatuses.accepted_by_taxi.name,
        to: hailStatuses.timeout_customer.name
      },
      {
        name: hailStatuses.declined_by_customer.name,
        from: [
          hailStatuses.received.name,
          hailStatuses.sent_to_operator.name,
          hailStatuses.received_by_operator.name,
          hailStatuses.received_by_taxi.name,
          hailStatuses.accepted_by_taxi.name
        ],
        to: hailStatuses.declined_by_customer.name
      },
      {
        name: hailStatuses.accepted_by_customer.name,
        from: hailStatuses.accepted_by_taxi.name,
        to: hailStatuses.accepted_by_customer.name
      },
      {
        name: hailStatuses.customer_on_board.name,
        from: hailStatuses.accepted_by_customer.name,
        to: hailStatuses.customer_on_board.name
      },
      {
        name: hailStatuses.finished.name,
        from: hailStatuses.customer_on_board.name,
        to: hailStatuses.finished.name
      },
      {
        name: hailStatuses.incident_taxi.name,
        from: [hailStatuses.accepted_by_taxi.name, hailStatuses.accepted_by_customer.name],
        to: hailStatuses.incident_taxi.name
      },
      {
        name: hailStatuses.incident_customer.name,
        from: hailStatuses.accepted_by_customer.name,
        to: hailStatuses.incident_customer.name
      },
      {
        name: hailStatuses.failure.name,
        from: [
          hailStatuses.emitted.name,
          hailStatuses.received.name,
          hailStatuses.sent_to_operator.name,
          hailStatuses.received_by_operator.name,
          hailStatuses.accepted_by_customer.name,
          hailStatuses.customer_on_board.name
        ],
        to: hailStatuses.failure.name
      }
    ]
  });
}

export function createFsmDiagram() {
  const fsm = createHailStatusFsm('emitted');
  const bpmn = visualize(fsm);

  return bpmn;
}

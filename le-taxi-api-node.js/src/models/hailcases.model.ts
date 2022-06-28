// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export enum cases {
  accepted_by_customer_after_timeout,
  accepted_by_taxi_after_timeout,
  canceled_by_customer,
  canceled_by_taxi_after_accepted_by_customer,
  canceled_by_taxi_before_accepted_by_customer,
  declined_by_customer,
  failure_example,
  happy_path,
  not_accepted_by_taxi
}

export class HailCases {
  constructor(private caseName: cases) {
    this.actions = new Array();
    switch (caseName) {
      case cases.happy_path:
        this.actions.push(new ActionHail('received_by_taxi', 0));
        this.actions.push(new ActionHail('accepted_by_taxi', 10 * 1000));
        // Send accepted_by_customer
        this.actions.push(new ActionHail('customer_on_board', 10 * 1000));
        this.actions.push(new ActionHail('finished', 10 * 1000));
        // Check state is finished
        // Optional - Send rating
        break;
      case cases.not_accepted_by_taxi:
        this.actions.push(new ActionHail('received_by_taxi', 0 * 1000));
        this.actions.push(new ActionHail('declined_by_taxi', 10 * 1000));
        // Check state is declined_by_taxi
        break;
      case cases.declined_by_customer:
        this.actions.push(new ActionHail('received_by_taxi', 0));
        this.actions.push(new ActionHail('accepted_by_taxi', 10 * 1000));
        // Send declined_by_customer
        // Check state is declined_by_customer
        break;
      case cases.accepted_by_customer_after_timeout:
        this.actions.push(new ActionHail('received_by_taxi', 0));
        this.actions.push(new ActionHail('accepted_by_taxi', 10 * 1000));
        // Wait accepted_by_taxi timeout
        // Optional - Send accepted_by_customer
        // Check state is timeout_customer
        break;
      case cases.accepted_by_taxi_after_timeout:
        this.actions.push(new ActionHail('received_by_taxi', 0));
        // Wait received_by_taxi timeout
        // Check state is timeout_taxi
        break;
      case cases.canceled_by_taxi_after_accepted_by_customer:
        this.actions.push(new ActionHail('received_by_taxi', 0));
        this.actions.push(new ActionHail('accepted_by_taxi', 10 * 1000));
        // Send accepted_by_customer
        this.actions.push(new ActionHail('incident_taxi', 10 * 1000, 'breakdown'));
        // Check state is incident_taxi
        break;
      case cases.canceled_by_customer:
        this.actions.push(new ActionHail('received_by_taxi', 0));
        this.actions.push(new ActionHail('accepted_by_taxi', 10 * 1000));
        // Send accepted_by_customer
        // Send incident_customer
        // Check state is incident_customer
        break;
      case cases.canceled_by_taxi_before_accepted_by_customer:
        this.actions.push(new ActionHail('received_by_taxi', 0));
        this.actions.push(new ActionHail('accepted_by_taxi', 10 * 1000));
        this.actions.push(new ActionHail('incident_taxi', 10 * 1000, 'breakdown'));
        // Check state is incident_taxi
        break;
      case cases.failure_example:
        this.actions.push(new ActionHail('failure', 0));
        // Check state is failure
        break;
    }
  }

  actions: Array<ActionHail>;
  public get case(): cases { return this.caseName; }
}

export class ActionHail {
  constructor(statut: string, timeout?: number, reason?: string) {
    this.statut = statut;
    this.timeout = timeout;
    this.reason = reason;
  }
  statut: string;
  timeout: number;
  reason: string;
}

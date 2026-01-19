// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from "chai";
import { TaxiStatus } from "../../libs/taxiStatus";
import { addSec, nowUtcIsoString } from "../shared/dateUtils/dateUtils";
import { TripBuilder } from "./trip.builder";

describe("Trip builder", () => {
  it("Should be able to extract a simple trip", () => {
    const builder = new TripBuilder();

    const now = nowUtcIsoString();
    const scenario = [
      { status: TaxiStatus.Free, lat: "45", lon: "-73", receivedDelta: 5 },
      {
        status: TaxiStatus.Occupied,
        lat: "45.1",
        lon: "-73.1",
        receivedDelta: 5,
      }, // Trip start now + 10
      {
        status: TaxiStatus.Occupied,
        lat: "45.2",
        lon: "-73.2",
        receivedDelta: 5,
      },
      { status: TaxiStatus.Free, lat: "45.3", lon: "-73.3", receivedDelta: 5 }, // Trip end now + 20
    ];

    processScenario(builder, scenario, now);

    const departureTime = addSec(now, 10);
    const arrivalTime = addSec(now, 20);
    const totalDuration = 10;

    const trips = builder.getCompletedTrips();
    assert.strictEqual(trips.length, 1);
    assert.strictEqual(trips[0].departureTime, departureTime);
    assert.strictEqual(trips[0].arrivalTime, arrivalTime);
    assert.strictEqual(trips[0].totalDurationSeconds, totalDuration);
    assert.strictEqual(trips[0].departureLat, 45.1);
    assert.strictEqual(trips[0].departureLon, -73.1);
    assert.strictEqual(trips[0].arrivalLat, 45.3);
    assert.strictEqual(trips[0].arrivalLon, -73.3);
  });

  it("Should return no trips if none processed", () => {
    const builder = new TripBuilder();

    const now = nowUtcIsoString();
    const scenario = [];

    processScenario(builder, scenario, now);

    const trips = builder.getCompletedTrips();
    assert.strictEqual(trips.length, 0);
  });

  it("Should ignore already started trips at startup", () => {
    const builder = new TripBuilder();

    const now = nowUtcIsoString();
    const scenario = [
      { status: TaxiStatus.Occupied, lat: "45", lon: "-73", receivedDelta: 5 },
      {
        status: TaxiStatus.Occupied,
        lat: "45.1",
        lon: "-73.1",
        receivedDelta: 5,
      },
      {
        status: TaxiStatus.Occupied,
        lat: "45.2",
        lon: "-73.2",
        receivedDelta: 5,
      },
      { status: TaxiStatus.Free, lat: "45.3", lon: "-73.3", receivedDelta: 5 },
    ];

    processScenario(builder, scenario, now);

    const trips = builder.getCompletedTrips();
    assert.strictEqual(trips.length, 0);
  });

  it("Should ignore trips not finished", () => {
    const builder = new TripBuilder();

    const now = nowUtcIsoString();
    const scenario = [
      { status: TaxiStatus.Free, lat: "45", lon: "-73", receivedDelta: 5 },
      {
        status: TaxiStatus.Occupied,
        lat: "45.1",
        lon: "-73.1",
        receivedDelta: 5,
      },
      {
        status: TaxiStatus.Occupied,
        lat: "45.2",
        lon: "-73.2",
        receivedDelta: 5,
      },
      {
        status: TaxiStatus.Occupied,
        lat: "45.3",
        lon: "-73.3",
        receivedDelta: 5,
      },
    ];

    processScenario(builder, scenario, now);

    const trips = builder.getCompletedTrips();
    assert.strictEqual(trips.length, 0);
  });

  it("Should be able to extract trips spanned over two batches", () => {
    const builder = new TripBuilder();

    const nowA = nowUtcIsoString();
    const scenarioA = [
      { status: TaxiStatus.Free, lat: "45", lon: "-73", receivedDelta: 5 },
      {
        status: TaxiStatus.Occupied,
        lat: "45.1",
        lon: "-73.1",
        receivedDelta: 5,
      }, // Trip start nowA + 10
    ];

    processScenario(builder, scenarioA, nowA);

    const tripsA = builder.getCompletedTrips();
    assert.strictEqual(tripsA.length, 0);

    const nowB = addSec(nowA, 10);
    const scenarioB = [
      {
        status: TaxiStatus.Occupied,
        lat: "45.2",
        lon: "-73.2",
        receivedDelta: 5,
      },
      { status: TaxiStatus.Free, lat: "45.3", lon: "-73.3", receivedDelta: 5 }, // Trip end nowB + 10
    ];

    processScenario(builder, scenarioB, nowB);

    const departureTime = addSec(nowA, 10);
    const arrivalTime = addSec(nowB, 10);
    const totalDuration = 10;

    const tripsB = builder.getCompletedTrips();
    assert.strictEqual(tripsB.length, 1);
    assert.strictEqual(tripsB[0].departureTime, departureTime);
    assert.strictEqual(tripsB[0].arrivalTime, arrivalTime);
    assert.strictEqual(tripsB[0].totalDurationSeconds, totalDuration);
  });

  it("Should be able to extract trips ending right between two batches", () => {
    const builder = new TripBuilder();

    const nowA = nowUtcIsoString();
    const scenarioA = [
      { status: TaxiStatus.Free, lat: "45", lon: "-73", receivedDelta: 5 },
      {
        status: TaxiStatus.Occupied,
        lat: "45.1",
        lon: "-73.1",
        receivedDelta: 5,
      }, // Trip start nowA + 10
      {
        status: TaxiStatus.Occupied,
        lat: "45.2",
        lon: "-73.2",
        receivedDelta: 5,
      },
    ];

    processScenario(builder, scenarioA, nowA);

    const tripsA = builder.getCompletedTrips();
    assert.strictEqual(tripsA.length, 0);

    const nowB = addSec(nowA, 15);
    const scenarioB = [
      { status: TaxiStatus.Free, lat: "45.3", lon: "-73.3", receivedDelta: 5 },
    ]; // Trip end nowB + 5

    processScenario(builder, scenarioB, nowB);

    const departureTime = addSec(nowA, 10);
    const arrivalTime = addSec(nowB, 5);
    const totalDuration = 10;

    const tripsB = builder.getCompletedTrips();
    assert.strictEqual(tripsB.length, 1);
    assert.strictEqual(tripsB[0].departureTime, departureTime);
    assert.strictEqual(tripsB[0].arrivalTime, arrivalTime);
    assert.strictEqual(tripsB[0].totalDurationSeconds, totalDuration);
  });

  it("Should be able to extract trips starting right between two batches", () => {
    const builder = new TripBuilder();

    const nowA = nowUtcIsoString();
    const scenarioA = [
      { status: TaxiStatus.Free, lat: "45", lon: "-73", receivedDelta: 5 },
    ];

    processScenario(builder, scenarioA, nowA);

    const tripsA = builder.getCompletedTrips();
    assert.strictEqual(tripsA.length, 0);

    const nowB = addSec(nowA, 5);
    const scenarioB = [
      {
        status: TaxiStatus.Occupied,
        lat: "45.1",
        lon: "-73.1",
        receivedDelta: 5,
      }, // Trip start nowB + 5
      {
        status: TaxiStatus.Occupied,
        lat: "45.2",
        lon: "-73.2",
        receivedDelta: 5,
      },
      { status: TaxiStatus.Free, lat: "45.3", lon: "-73.3", receivedDelta: 5 }, // Trip end nowB + 15
    ];

    processScenario(builder, scenarioB, nowB);

    const departureTime = addSec(nowB, 5);
    const arrivalTime = addSec(nowB, 15);
    const totalDuration = 10;

    const tripsB = builder.getCompletedTrips();
    assert.strictEqual(tripsB.length, 1);
    assert.strictEqual(tripsB[0].departureTime, departureTime);
    assert.strictEqual(tripsB[0].arrivalTime, arrivalTime);
    assert.strictEqual(tripsB[0].totalDurationSeconds, totalDuration);
  });
});

function processScenario(builder: TripBuilder, scenario: any[], now: string) {
  let time = now;
  scenario.forEach((position) => {
    time = addSec(time, position.receivedDelta);
    const snapshot = getTaxiPositionSnapshot(
      time,
      position.status,
      position.lat,
      position.lon,
    );
    builder.parseTaxiPositionSnapshot(snapshot);
  });
}

function getTaxiPositionSnapshot(
  time: string,
  status: string,
  lat: string,
  lon: string,
) {
  return {
    receivedAt: new Date(time),
    items: [
      {
        taxi: "taxi",
        lat,
        lon,
        status,
        operator: "",
        device: "",
        version: "",
        timestamp: "",
        speed: 0,
        azimuth: 0,
      },
    ],
  };
}

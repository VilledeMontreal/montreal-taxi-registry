// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { round } from 'lodash';
import { getRoutesFromTaxiRegistryOsrm } from './osrm.apiClient';
import { IRoutePath, IRoutingTest } from './osrm.types';

const METER_TOLERANCE = 3;
const SECOND_TOLERANCE = 3;

export const crudRoutingTests: IRoutingTest[] = [
  {
    title: `from the 80 queen to 275 rue notre-dame Est`,
    arrange: {
      closestTaxi: { lat: 45.49714, lon: -73.55461 },
      from: { lat: 45.49714, lon: -73.55461 },
      to: { lat: 45.50903, lon: -73.55433 }
    },
    expectedResponse: {
      statusCode: StatusCodes.OK,
      legTaxiToFrom: {
        steps: [],
        weight: 0,
        distance: 0,
        summary: '',
        duration: 0
      },
      legFromToDestination: {
        steps: [],
        weight: 238.4,
        distance: 1651.1,
        summary: '',
        duration: 238.4
      }
    }
  },
  {
    title: `for the longest distance on the island of Montreal`,
    arrange: {
      closestTaxi: { lat: 45.42188, lon: -73.96382 },
      from: { lat: 45.40536, lon: -73.93753 },
      to: { lat: 45.68346, lon: -73.50831 }
    },
    expectedResponse: {
      statusCode: StatusCodes.OK,
      legTaxiToFrom: {
        steps: [],
        weight: 1016.1,
        distance: 16341,
        summary: '',
        duration: 1016.1
      },
      legFromToDestination: {
        steps: [],
        weight: 3078.8,
        distance: 51985.1,
        summary: '',
        duration: 3078.8
      }
    }
  },
  {
    title: `along the sherbrooke street west to sherbrooke street East`,
    arrange: {
      closestTaxi: { lat: 45.42188, lon: -73.96382 },
      from: { lat: 45.40536, lon: -73.93753 },
      to: { lat: 45.68346, lon: -73.50831 }
    },
    expectedResponse: {
      statusCode: StatusCodes.OK,
      legTaxiToFrom: {
        steps: [],
        weight: 1016.1,
        distance: 16341,
        summary: '',
        duration: 1016.1
      },
      legFromToDestination: {
        steps: [],
        weight: 3078.8,
        distance: 51985.1,
        summary: '',
        duration: 3078.8
      }
    }
  },
  {
    title: `for a trip from Montreal island to south shore`,
    arrange: {
      closestTaxi: { lat: 45.53156, lon: -73.59111 },
      from: { lat: 45.52591, lon: -73.58145 },
      to: { lat: 45.47447, lon: -73.45246 }
    },
    expectedResponse: {
      statusCode: StatusCodes.OK,
      legTaxiToFrom: {
        steps: [],
        weight: 244,
        distance: 1421.4,
        summary: '',
        duration: 242.4
      },
      legFromToDestination: {
        steps: [],
        weight: 1275.9,
        distance: 14014,
        summary: '',
        duration: 1275.9
      }
    }
  },
  {
    title: `for a trip from south shore to Montreal island`,
    arrange: {
      closestTaxi: { lat: 45.59435, lon: -73.51821 },
      from: { lat: 45.58643, lon: -73.44323 },
      to: { lat: 45.47587, lon: -73.58605 }
    },
    expectedResponse: {
      statusCode: StatusCodes.OK,
      legTaxiToFrom: {
        steps: [],
        weight: 959.3,
        distance: 11562.3,
        summary: '',
        duration: 959.3
      },
      legFromToDestination: {
        steps: [],
        weight: 1580.5,
        distance: 21805.6,
        summary: '',
        duration: 1580.5
      }
    }
  },
  {
    title: `for a trip from Montreal island to north shore`,
    arrange: {
      closestTaxi: { lat: 45.53156, lon: -73.59111 },
      from: { lat: 45.52591, lon: -73.58145 },
      to: { lat: 45.62619, lon: -73.849482 }
    },
    expectedResponse: {
      statusCode: StatusCodes.OK,
      legTaxiToFrom: {
        steps: [],
        weight: 244,
        distance: 1421.4,
        summary: '',
        duration: 242.4
      },
      legFromToDestination: {
        steps: [],
        weight: 1856.4,
        distance: 28430.7,
        summary: '',
        duration: 1856.4
      }
    }
  },
  {
    title: `for a trip from Montreal island to north shore`,
    arrange: {
      closestTaxi: { lat: 45.59435, lon: -73.51821 },
      from: { lat: 45.62619, lon: -73.849482 },
      to: { lat: 45.47587, lon: -73.58605 }
    },
    expectedResponse: {
      statusCode: StatusCodes.OK,
      legTaxiToFrom: {
        steps: [],
        weight: 2047,
        distance: 36365.2,
        summary: '',
        duration: 2047
      },
      legFromToDestination: {
        steps: [],
        weight: 1857.9,
        distance: 31625.2,
        summary: '',
        duration: 1857.9
      }
    }
  },
  {
    title: `for trip from Montreal to Gaspé`,
    arrange: {
      closestTaxi: { lat: 45.59435, lon: -73.51821 },
      from: { lat: 45.52591, lon: -73.58145 },
      to: { lat: 48.83036, lon: -64.48278 }
    },
    expectedResponse: {
      statusCode: StatusCodes.OK,
      legTaxiToFrom: {
        steps: [],
        weight: 1178.7,
        distance: 10636.2,
        summary: '',
        duration: 1178.7
      },
      legFromToDestination: {
        steps: [],
        weight: 45582.4,
        distance: 914707.7,
        summary: '',
        duration: 45560.7
      }
    }
  },
  {
    title: `if closest taxi, source and destination are all the same`,
    arrange: {
      closestTaxi: { lat: 45.47462, lon: -73.60835 },
      from: { lat: 45.47462, lon: -73.60835 },
      to: { lat: 45.47462, lon: -73.60835 }
    },
    expectedResponse: {
      statusCode: StatusCodes.OK,
      legTaxiToFrom: {
        steps: [],
        weight: 0,
        distance: 0,
        summary: '',
        duration: 0
      },
      legFromToDestination: {
        steps: [],
        weight: 0,
        distance: 0,
        summary: '',
        duration: 0
      }
    }
  }
];

// tslint:disable:max-line-length
export async function crudOsrmTests(): Promise<void> {
  describe(`Should return successfully response`, () => {
    crudRoutingTests.forEach(({ title, arrange: { closestTaxi, from, to }, expectedResponse }) => {
      it(`Should return a valid OSRM response, ${title}`, async () => {
        const taxiRegistryOsrmResponse = await getRoutesFromTaxiRegistryOsrm(closestTaxi, from, to);
        assert.equal(taxiRegistryOsrmResponse.status, expectedResponse.statusCode);

        const taxiRegistryOsrm = buildRouteLegs(taxiRegistryOsrmResponse);

        const deltaDistanceTaxiToFromMeter = round(
          Math.abs(taxiRegistryOsrm.legTaxiToFrom.distance - expectedResponse.legTaxiToFrom.distance),
          2
        );
        assert.isBelow(deltaDistanceTaxiToFromMeter, METER_TOLERANCE);

        const deltaDistanceFromToDestinationMeter = round(
          Math.abs(taxiRegistryOsrm.legFromToDestination.distance - expectedResponse.legFromToDestination.distance),
          2
        );
        assert.isBelow(deltaDistanceFromToDestinationMeter, METER_TOLERANCE);

        const deltaDistanceTaxiToFromSecond = round(
          Math.abs(taxiRegistryOsrm.legFromToDestination.duration - expectedResponse.legFromToDestination.duration),
          0
        );
        assert.isBelow(deltaDistanceTaxiToFromSecond, SECOND_TOLERANCE);

        const deltaDistanceFromToDestinationSecond = round(
          Math.abs(taxiRegistryOsrm.legFromToDestination.duration - expectedResponse.legFromToDestination.duration),
          0
        );
        assert.isBelow(deltaDistanceFromToDestinationSecond, SECOND_TOLERANCE);
      });
    });
  });
}

export function buildRouteLegs(osrmResponse: any): IRoutePath {
  const [legTaxiToFrom, legFromToDestination] = osrmResponse?.body?.routes[0].legs;
  return {
    legTaxiToFrom,
    legFromToDestination
  };
}

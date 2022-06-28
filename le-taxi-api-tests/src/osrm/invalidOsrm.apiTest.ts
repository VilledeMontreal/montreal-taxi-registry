// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';

import { shouldThrow } from '../shared/commonTests/testUtil';
import { getRoutesFromTaxiRegistryOsrm } from './osrm.apiClient';
import { IRoutingTest } from './osrm.types';

const invalidRoutingTests: IRoutingTest[] = [
  {
    title: `if latitude or longitude are null`,
    arrange: {
      closestTaxi: { lat: null, lon: null },
      from: { lat: null, lon: null },
      to: { lat: null, lon: null }
    },
    expectedResponse: {
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'Query string malformed close to position 14'
    }
  },
  {
    title: `if latitude or longitude are empty string`,
    arrange: {
      // @ts-ignore
      closestTaxi: { lat: '', lon: '' },
      // @ts-ignore
      from: { lat: '', lon: '' },
      // @ts-ignore
      to: { lat: '', lon: '' }
    },
    expectedResponse: {
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'Query string malformed close to position 14'
    }
  }
];
// tslint:disable:max-line-length
export async function invalidOsrmTests(): Promise<void> {
  invalidRoutingTests.forEach(({ title, arrange: { closestTaxi, from, to }, expectedResponse }) => {
    it(`Should return error response, ${title}`, async () => {
      await shouldThrow(
        () => getRoutesFromTaxiRegistryOsrm(closestTaxi, from, to),
        err => {
          assert.strictEqual(err.status, expectedResponse.statusCode);
          assert.strictEqual(err.response.body.message, expectedResponse.message);
        }
      );
    });
  });
}

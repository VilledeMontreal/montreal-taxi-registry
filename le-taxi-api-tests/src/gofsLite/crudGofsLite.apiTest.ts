// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { createTaxisWithPromotions } from '../gtfsInquiry/gtfsInquiry.fixture';
import { generateSouthShoreCoordinates, generateSouthShoreLat, generateSouthShoreLon } from '../shared/commonLoadTests/specialRegion';
import { getFeed, getServiceBrand, getSystemInformation, postGofsLite } from './gofsLite.apiClient';

// tslint:disable: max-func-body-length
export async function crudGofsLiteTests(): Promise<void> {
  it(`Should be able to request GOFS feed`, async () => {
    const response = await getFeed();
    assert.strictEqual(response.status, StatusCodes.OK);
  });

  it(`Should be able to request GOFS wait_time`, async () => {
    await createTaxisWithPromotions([{ ...generateSouthShoreCoordinates(), type: 'sedan' }]);
    const waitTimeRequest = {
      pickup_lat: generateSouthShoreLat(),
      pickup_lon: generateSouthShoreLon(),
      drop_off_lat: generateSouthShoreLat(),
      drop_off_lon: generateSouthShoreLon(),
      brand_id: [] as string[],
    };

    const inquiryResponse = await postGofsLite(waitTimeRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
  });

  it(`Should be able to request GOFS service_brand`, async () => {
    const response = await getServiceBrand();
    assert.strictEqual(response.status, StatusCodes.OK);
  });

  it(`Should be able to request GOFS system_information`, async () => {
    const response = await getSystemInformation();
    assert.strictEqual(response.status, StatusCodes.OK);
  });
}

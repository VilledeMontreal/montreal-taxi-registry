// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { createTaxisWithPromotions } from '../gtfsInquiry/gtfsInquiry.fixture';
import { generateSouthShoreCoordinates, generateSouthShoreLat, generateSouthShoreLon } from '../shared/commonLoadTests/specialRegion';
import { postGofsLite } from './gofsLite.apiClient';

// tslint:disable: max-func-body-length
export async function crudGofsLiteTests(): Promise<void> {

  it(`Should be able to request wait_time`, async () => {
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
}
// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { createTaxisWithPromotions } from '../gtfsInquiry/gtfsInquiry.fixture';
import {
  generateApiTestCoordinates,
  generateLatForApiTest,
  generateLonForApiTest
} from '../shared/commonLoadTests/specialRegion';
import { toQueryString } from '../shared/utils/queryStringUtils';
import {
  getCalendars,
  getFeed,
  getOperatingRules,
  getRealtimeBooking,
  getServiceBrands,
  getSystemInformation,
  getZones
} from './gofsLite.apiClient';

// tslint:disable: max-func-body-length
export async function crudGofsLiteTests(): Promise<void> {
  it(`Should be able to request GOFS feed with expected payload`, async () => {
    const response = await getFeed();
    assert.strictEqual(response.status, StatusCodes.OK);
    assert.nestedProperty(response.body, 'data.en.feeds');
    assert.nestedProperty(response.body, 'data.fr.feeds');

    const feedsEn: any[] = response.body.data.en.feeds;
    feedsEn.forEach(feed => {
      assert.exists(feed?.name);
      assert.notMatch(feed.name, /\.json$/, 'name should not end with .json extension');
    });

    const feedsFr: any[] = response.body.data.fr.feeds;
    feedsFr.forEach(feed => {
      assert.exists(feed?.name);
      assert.notMatch(feed.name, /\.json$/, 'name should not end with .json extension');
    });
  });

  it(`Should be able to request GOFS realtime_booking`, async () => {
    await createTaxisWithPromotions([{ ...generateApiTestCoordinates(), type: 'sedan' }]);
    const queryParams = {
      pickup_lat: generateLatForApiTest(),
      pickup_lon: generateLonForApiTest(),
      drop_off_lat: generateLatForApiTest(),
      drop_off_lon: generateLonForApiTest(),
      brand_id: [] as string[]
    };

    const inquiryResponse = await getRealtimeBooking(toQueryString(queryParams));

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
  });

  it(`Should be able to request GOFS service_brands`, async () => {
    const response = await getServiceBrands();
    assert.strictEqual(response.status, StatusCodes.OK);
  });

  it(`Should be able to request GOFS system_information`, async () => {
    const response = await getSystemInformation();
    assert.strictEqual(response.status, StatusCodes.OK);
  });

  it(`Should be able to request GOFS zones with expected payload`, async () => {
    const response = await getZones();
    assert.strictEqual(response.status, StatusCodes.OK);

    assert.nestedProperty(response.body, 'data.zones.features');

    const features = response.body.data.zones.features;
    assert.isAbove(features?.length, 0);

    features.forEach((feature: any) => {
      assert.exists(feature?.id);
      assert.exists(feature?.zone_id);
      assert.strictEqual(feature.zone_id, feature.id);

      assert.exists(feature?.properties);
      assert.nestedProperty(feature, 'properties.name');
      assert.nestedProperty(feature, 'properties.description');

      assert.notNestedProperty(feature, 'properties.stop_name');
      assert.notNestedProperty(feature, 'properties.stop_desc');
    });
  });

  it(`Should be able to request GOFS operating rules`, async () => {
    const response = await getOperatingRules();
    assert.strictEqual(response.status, StatusCodes.OK);
  });

  it(`Should be able to request GOFS calendars`, async () => {
    const response = await getCalendars();
    assert.strictEqual(response.status, StatusCodes.OK);
  });
}

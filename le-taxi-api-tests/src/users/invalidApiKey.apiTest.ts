// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';

import { getAbsoluteUrl } from '../../config/configs';
import { copyDriverTemplate } from '../drivers/driverDto.template';
import { getCurrentUnixTime, shouldThrow } from '../shared/commonTests/testUtil';
import { superagentWithStats } from '../shared/e2eTesting/superagentWithStats';
import { copyTaxiPositionTemplate } from '../taxiPositionSnapShots/taxiPositionSnapShotsDto.template';

// tslint:disable-next-line: max-func-body-length
export async function invalidApiKeyTests(): Promise<void> {
  it('Api node: an api key that does not exist should return 401', async () => {
    await shouldThrow(
      () => checkApiWithApikey('dont-exist-api-key'),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.include(err.response.body.error.message, 'API key is missing or invalid');
      }
    );
  });

  it('Api node: a falsy api key should return 401', async () => {
    await shouldThrow(
      () => checkApiWithApikey(''),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.include(err.response.body.error.message, 'API key is missing or invalid');
      }
    );
  });

  it('Api node: no api key should return 401', async () => {
    await shouldThrow(
      () => checkApiWithoutApikey(),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.include(err.response.body.error.message, 'API key is missing or invalid');
      }
    );
  });

  it('Geoserver: an api key that does not exist should return 401', async () => {
    await shouldThrow(
      () => checkGeoServerWithApikey('dont-exist-api-key'),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.include(err.response.body.error.message, 'API key is missing or invalid');
      }
    );
  });

  it('Geoserver: a falsy api key should return 401', async () => {
    await shouldThrow(
      () => checkGeoServerWithApikey(''),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.include(err.response.body.error.message, 'API key is missing');
      }
    );
  });

  it('Geoserver: no api key should return 401', async () => {
    await shouldThrow(
      () => checkGeoServerWithoutApikey(),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.include(err.response.body.error.message, 'API key is missing');
      }
    );
  });
}

async function checkApiWithApikey(apiKey: string) {
  const dto = copyDriverTemplate();
  await superagentWithStats
    .post(getAbsoluteUrl('/api/drivers/'))
    .set('X-API-KEY', apiKey)
    .set('Content-Type', 'application/json')
    .send(dto);
}

async function checkApiWithoutApikey() {
  const dto = copyDriverTemplate();
  await superagentWithStats
    .post(getAbsoluteUrl('/api/drivers/'))
    .set('Content-Type', 'application/json')
    .send(dto);
}

async function checkGeoServerWithApikey(apiKey: string) {
  const dto = copyTaxiPositionTemplate(x => (x.items[0].timestamp = getCurrentUnixTime()));
  await superagentWithStats
    .post(getAbsoluteUrl('/api/taxi-position-snapshots'))
    .set('X-API-KEY', apiKey)
    .set('Content-Type', 'application/json')
    .send(dto);
}

async function checkGeoServerWithoutApikey() {
  const dto = copyTaxiPositionTemplate(x => (x.items[0].timestamp = getCurrentUnixTime()));
  await superagentWithStats
    .post(getAbsoluteUrl('/api/taxi-position-snapshots'))
    .set('Content-Type', 'application/json')
    .send(dto);
}

// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';

import { shouldThrow } from '../shared/commonTests/testUtil';
import { UserRole } from '../shared/commonTests/UserRole';
import { postDtoIsString } from '../shared/taxiRegistryHttp/taxiRegistryHttp';
import { setupNewTaxi } from '../taxis/taxi.fixture';
import { copyTaxiTemplate } from '../taxis/taxisDto.template';
import { getImmutableUser, getImmutableUserApiKey } from '../users/user.sharedFixture';

export async function invalidJsonTests(): Promise<void> {
  it('api-node. Should be a 400 error: Invalid json', async () => {
    const apiKey = await getImmutableUserApiKey(UserRole.Operator);
    const wrongFormatDto = `{
      "data": [
        {
          "birth_date: "1950-12-22",
          "departement": {
            "nom": "Québec",
            "numero": "1000"
          },
          "first_name": "Jon",
          "last_name": "Doe",
          "professional_licence": "XT0001"
        }
      ]
    }`;
    await shouldThrow(
      () => postDtoIsString('/api/vehicles/', wrongFormatDto, apiKey),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'Unexpected number in JSON at position');
      }
    );
  });

  it('geo-taxi. Should be a 400 error: Invalid json', async () => {
    const operatorUser = await getImmutableUser(UserRole.Operator);
    const taxi = await setupNewTaxi(copyTaxiTemplate(), operatorUser.apikey);
    const wrongFormatDto = `{
      "items": [
        {
          "azimuth": "125",
          "device: "piscine",
          "lat": "45.515151",
          "lon": "-73.585858",
          "operator": "${operatorUser.email}",
          "speed": "57",
          "status": "free",
          "taxi": "${taxi.id}",
          "timestamp": "${Math.floor(Date.now() / 1000)}",
          "version": "2"
        }
      ]
    }`;
    await shouldThrow(
      () => postDtoIsString('/api/taxi-position-snapshots/', wrongFormatDto, operatorUser.apikey),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'Unexpected token p in JSON at position');
      }
    );
  });
}

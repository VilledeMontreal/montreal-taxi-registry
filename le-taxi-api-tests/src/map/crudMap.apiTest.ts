// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';

import { UserRole } from '../shared/commonTests/UserRole';
import { setupNewTaxi } from '../taxis/taxi.fixture';
import { copyTaxiTemplate } from '../taxis/taxisDto.template';
import { createNonImmutableUser } from '../users/user.sharedFixture';
import { getTaxiData, getTaxiOperators, getTaxiSearch } from './map.apiClient';

// tslint:disable-next-line: max-func-body-length
export async function crudMapTests(): Promise<void> {
  it('Can retrieve taxi-operators from map controller', async () => {
    const operator = await createNonImmutableUser(UserRole.Operator);

    const taxiOperatorsResponse = await getTaxiOperators();
    assert.strictEqual(taxiOperatorsResponse.status, StatusCodes.OK);

    const matchingOperators = taxiOperatorsResponse.body.filter((o: any) => o.name === operator.email);
    assert.strictEqual(matchingOperators.length, 1);
  });

  it('Can retrieve taxi-data from map controller', async () => {
    const taxiResponse = await setupNewTaxi(copyTaxiTemplate());
    assert.strictEqual(taxiResponse.status, StatusCodes.CREATED);

    const newTaxi = taxiResponse.body.data[0];

    const taxiDataResponse = await getTaxiData(newTaxi.id);
    assert.strictEqual(taxiDataResponse.status, StatusCodes.OK);
  });

  it('Can do a taxi-search with licencePlate from map controller', async () => {
    const taxiResponse = await setupNewTaxi(copyTaxiTemplate());
    assert.strictEqual(taxiResponse.status, StatusCodes.CREATED);

    const newTaxi = taxiResponse.body.data[0];

    const taxiSearchResponse = await getTaxiSearch(newTaxi.vehicle.licence_plate);
    assert.strictEqual(taxiSearchResponse.status, StatusCodes.OK);
  });

  it('Can do a taxi-search with professionalLicence from map controller', async () => {
    const taxiResponse = await setupNewTaxi(copyTaxiTemplate());
    assert.strictEqual(taxiResponse.status, StatusCodes.CREATED);

    const newTaxi = taxiResponse.body.data[0];

    const taxiSearchResponse = await getTaxiSearch(newTaxi.driver.professional_licence);
    assert.strictEqual(taxiSearchResponse.status, StatusCodes.OK);
  });
}

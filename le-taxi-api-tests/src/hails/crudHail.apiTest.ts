// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { configs } from '../../config/configs';
import { aFewSeconds } from '../shared/commonTests/testUtil';
import { UserRole } from '../shared/commonTests/UserRole';
import { getImmutableUserApiKey } from '../users/user.sharedFixture';
import { getHail, postHail, putHail } from './hail.apiClient';
import { StatusHail } from './hail.enum';
import {
  motorUpdateRating,
  motorUpdatesHailStatus,
  operatorGetHail,
  operatorGetTaxiRating,
  operatorUpdateIncidentTaxiReason,
  operatorUpdatesHailStatus,
  operatorUpdateTaxiPhone,
  setPositionTaxi,
  setupNewHail,
  setupNewHailFinished,
  setupNewHailReceivedByTaxi,
  setupNewTaxi,
  updateHailIncidentTaxiReason,
  updateHailTaxiPhoneNumber
} from './hail.fixture';
import { copyHailReportingCustomer, copyHailTemplate } from './hailDto.template';

// tslint:disable-next-line:max-func-body-length
export async function crudHailTests(): Promise<void> {
  testCreateHailUserAccessValid(UserRole.Admin);
  testCreateHailUserAccessValid(UserRole.Motor);

  testGetHailUserAccessValid(UserRole.Motor);
  testGetHailUserAccessValid(UserRole.Operator);
  testGetHailUserAccessValid(UserRole.Admin);

  it('Can create hail directly from fixture', async () => {
    const dtoCreate = copyHailTemplate();
    const responseHailPost = await setupNewHail(dtoCreate);
    assert.exists(responseHailPost);
  });

  it('Can initialize each hail attributes', async () => {
    const dtoCreate = copyHailTemplate();
    const responseHailPost = await setupNewHail(dtoCreate);
    const apiKeyOperator = await getImmutableUserApiKey(UserRole.Operator);
    const hail = await getHail(responseHailPost.body.data[0].id, apiKeyOperator);
    assert.strictEqual(responseHailPost.body.data[0].id, hail.body.data[0].id);
    assert.strictEqual(responseHailPost.body.data[0].taxi_id, hail.body.data[0].taxi_id);
    assert.strictEqual(responseHailPost.body.data[0].operateur, hail.body.data[0].operateur);
    assert.strictEqual(responseHailPost.body.data[0].taxi.id, hail.body.data[0].taxi.id);
    assert.strictEqual(responseHailPost.body.data[0].customer_id, hail.body.data[0].customer_id);
    assert.strictEqual(responseHailPost.body.data[0].customer_lat, hail.body.data[0].customer_lat);
    assert.strictEqual(responseHailPost.body.data[0].customer_lon, hail.body.data[0].customer_lon);
    assert.strictEqual(responseHailPost.body.data[0].customer_phone_number, hail.body.data[0].customer_phone_number);
    assert.strictEqual(responseHailPost.body.data[0].customer_address, hail.body.data[0].customer_address);
    assert.strictEqual(responseHailPost.body.data[0].taxi_vignette, hail.body.data[0].taxi_vignette);
    assert.strictEqual(responseHailPost.body.data[0].taxi_relation.rating, hail.body.data[0].taxi_relation.rating);
  });

  it('Can initialize creation_datetime', async () => {
    const dtoCreate = copyHailTemplate();
    const responseHailPost = await setupNewHail(dtoCreate);
    const apiKeyOperator = await getImmutableUserApiKey(UserRole.Operator);
    const hail = await getHail(responseHailPost.body.data[0].id, apiKeyOperator);

    assert.approximately(new Date(hail.body.data[0].creation_datetime).getTime(), new Date().getTime(), 10000);
  });

  it('Should be set last_status_change and last_status_change > creation_datetime', async () => {
    const hailId = await setupNewHailReceivedByTaxi();

    const hail = await operatorGetHail(hailId);

    assert.isAbove(
      new Date(hail.body.data[0].last_status_change).getTime(),
      new Date(hail.body.data[0].creation_datetime).getTime()
    );
  });

  it('Should be last_status_change>last_status_change when set different status', async () => {
    const hailId = await setupNewHailReceivedByTaxi();
    const hailReceivedByTaxi = await operatorGetHail(hailId);

    await aFewSeconds(2);
    await operatorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI);
    const hailAcceptedByTaxi = await operatorGetHail(hailId);

    assert.isAbove(
      new Date(hailAcceptedByTaxi.body.data[0].last_status_change).getTime(),
      new Date(hailReceivedByTaxi.body.data[0].last_status_change).getTime()
    );
  });

  it('Should be last_status_change = last_status_change when status is not set ', async () => {
    const hailId = await setupNewHailReceivedByTaxi();

    const hailBeforeSetRating = await operatorGetHail(hailId);
    await motorUpdateRating(hailId, 5, 'courtesy');
    const hailAfterSetRating = await operatorGetHail(hailId);

    assert.equal(
      new Date(hailBeforeSetRating.body.data[0].last_status_change).getTime(),
      new Date(hailAfterSetRating.body.data[0].last_status_change).getTime()
    );
  });

  it('5.2.3 Test Operator Happy Path', async () => {
    const hailId = await setupNewHailReceivedByTaxi();
    await operatorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI);
    await motorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_CUSTOMER);
    await operatorUpdatesHailStatus(hailId, StatusHail.CUSTOMER_ON_BOARD);
    await operatorUpdatesHailStatus(hailId, StatusHail.FINISHED);
  });

  it('5.2.4  Test Operator declined by Taxi', async () => {
    const hailId = await setupNewHailReceivedByTaxi();
    await operatorUpdatesHailStatus(hailId, StatusHail.DECLINED_BY_TAXI);
  });

  it('5.2.5  Test Operator Accepted by taxi after timeout', async () => {
    const hailId = await setupNewHailReceivedByTaxi();
    await aFewSeconds(configs.hails.exceedAnyHailStatusTimeoutInSec);

    const hail = await operatorGetHail(hailId);

    assert.strictEqual(hail.body.data[0].status, StatusHail.TIMEOUT_TAXI);
  });

  it('5.2.6  Test Operator canceled by Taxi', async () => {
    const hailId = await setupNewHailReceivedByTaxi();
    await operatorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI);
    await motorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_CUSTOMER);
    await operatorUpdatesHailStatus(hailId, StatusHail.INCIDENT_TAXI, null, 'breakdown');
  });

  it('5.2.7.1  Test Operator canceled by Client Incident customer', async () => {
    const hailId = await setupNewHailReceivedByTaxi();
    await operatorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI);
    await motorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_CUSTOMER);
    await motorUpdatesHailStatus(hailId, StatusHail.INCIDENT_CUSTOMER);
  });

  it('5.2.7.1  Test Operator declined by customer', async () => {
    const hailId = await setupNewHailReceivedByTaxi();
    await operatorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI);
    await motorUpdatesHailStatus(hailId, StatusHail.DECLINED_BY_CUSTOMER);
  });

  it('Should be taxi.last_update, taxi.position.lat nd taxi.position.lon not null when status active', async () => {
    const hailId = await setupNewHailReceivedByTaxi();
    await assertTaxiPositionWhenActiveStatus(hailId);

    await operatorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI);
    await assertTaxiPositionWhenActiveStatus(hailId);

    await motorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_CUSTOMER);
    await assertTaxiPositionWhenActiveStatus(hailId);

    await operatorUpdatesHailStatus(hailId, StatusHail.CUSTOMER_ON_BOARD);
    await assertTaxiPositionWhenActiveStatus(hailId);
  });

  it('Should be taxi.last_update, taxi.position.lat nd taxi.position.lon null when status inactive', async () => {
    const hailId = await setupNewHailReceivedByTaxi();
    await operatorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI);
    await motorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_CUSTOMER);
    await operatorUpdatesHailStatus(hailId, StatusHail.INCIDENT_TAXI, null, 'breakdown');
    const hailCustomerOnBoad = await operatorGetHail(hailId);
    assert.isNull(hailCustomerOnBoad.body.data[0].taxi.last_update);
    assert.isNull(hailCustomerOnBoad.body.data[0].taxi.position.lat);
    assert.isNull(hailCustomerOnBoad.body.data[0].taxi.position.lon);
  });

  it('Operator can be set Reporting customer', async () => {
    const hailId = await setupNewHailReceivedByTaxi();
    await operatorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI);
    await motorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_CUSTOMER);
    await operatorUpdatesHailStatus(hailId, StatusHail.CUSTOMER_ON_BOARD);
    const hailUpdated = await operatorUpdateReportingCustomer(hailId, true, 'payment');

    assert.isTrue(hailUpdated.body.data[0].reporting_customer);
    assert.strictEqual(hailUpdated.body.data[0].reporting_customer_reason, 'payment');

    await operatorUpdatesHailStatus(hailId, StatusHail.FINISHED);
  });

  it('Motor Should be set Rating ride', async () => {
    const hailId = await setupNewHailFinished();

    const hailUpdated = await motorUpdateRating(hailId, 5, 'courtesy');

    assert.strictEqual(hailUpdated.body.data[0].rating_ride, 5);
    assert.strictEqual(hailUpdated.body.data[0].rating_ride_reason, 'courtesy');
  });

  it('Motor Should be set a Rating ride any time', async () => {
    const hailId = await setupNewHailReceivedByTaxi();
    await operatorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI);
    await motorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_CUSTOMER);
    let hailUpdated = await motorUpdateRating(hailId, 1);

    assert.strictEqual(hailUpdated.body.data[0].rating_ride, 1);

    await operatorUpdatesHailStatus(hailId, StatusHail.CUSTOMER_ON_BOARD);

    hailUpdated = await motorUpdateRating(hailId, 2);

    assert.strictEqual(hailUpdated.body.data[0].rating_ride, 2);

    await operatorUpdatesHailStatus(hailId, StatusHail.FINISHED);

    hailUpdated = await motorUpdateRating(hailId, 5);

    assert.strictEqual(hailUpdated.body.data[0].rating_ride, 5);
  });

  // Fix in TM-1645
  it.skip('Should be calculate total average of rating from taxi_relation', async () => {
    const taxi = await setupNewTaxi();

    await testRatingTaxiAccumulated(taxi, 5, 5);
    await testRatingTaxiAccumulated(taxi, 4, 4.5);
    // important, rating should be rounded to a single digit
    await testRatingTaxiAccumulated(taxi, 1, 3.3);
  });

  // Fix in TM-1645
  it.skip('Should be calculate total average only when finished', async () => {
    const hailId = await setupNewHailReceivedByTaxi();
    await operatorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI);
    await motorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_CUSTOMER);

    let hailUpdated = await motorUpdateRating(hailId, 1);

    await operatorUpdatesHailStatus(hailId, StatusHail.CUSTOMER_ON_BOARD);

    hailUpdated = await motorUpdateRating(hailId, 2);

    await operatorUpdatesHailStatus(hailId, StatusHail.FINISHED);

    hailUpdated = await motorUpdateRating(hailId, 4);

    const apiKeyOperator = await getImmutableUserApiKey(UserRole.Operator);
    const hail = await getHail(hailUpdated.body.data[0].id, apiKeyOperator);

    assert.strictEqual(hail.body.data[0].taxi_relation.rating, 4);
  });

  // Fix in TM-1645
  it.skip('Should calculate total average of rating only from last rating_ride when status finished', async () => {
    const hailId = await setupNewHailFinished();
    await motorUpdateRating(hailId, 1);
    await motorUpdateRating(hailId, 2);
    await motorUpdateRating(hailId, 3);
    await motorUpdateRating(hailId, 4);
    await motorUpdateRating(hailId, 5);

    const updatedRating = await operatorGetTaxiRating(hailId);
    assert.strictEqual(updatedRating, 5);
  });

  it(`Should be null, incident_taxi_reason is ignored if not in the context of the transition to incident_taxi`, async () => {
    const apiKeyOperator = await getImmutableUserApiKey(UserRole.Operator);
    const hailId = await setupNewHailReceivedByTaxi();
    await operatorUpdateIncidentTaxiReason(hailId, 'traffic', apiKeyOperator);

    const hail = await getHail(hailId, apiKeyOperator);

    assert.isNull(hail.body.data[0].incident_taxi_reason);
  });

  it(`Should be null, Motor cannot change Reporting_customer and reporting_customer_reason when`, async () => {
    const apiKeyMotor = await getImmutableUserApiKey(UserRole.Motor);
    const hailId = await setupNewHailReceivedByTaxi();
    await operatorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI);
    await motorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_CUSTOMER);
    await operatorUpdatesHailStatus(hailId, StatusHail.CUSTOMER_ON_BOARD);
    const hailUpdated = await updateHailReportingCustomer(hailId, true, apiKeyMotor, 'payment');

    const hail = await operatorGetHail(hailId);

    assert.isNull(hail.body.data[0].reporting_customer);
    assert.isNull(hail.body.data[0].reporting_customer_reason);
    assert.strictEqual(hail.body.data[0].incident_taxi_reason, hailUpdated.body.data[0].incident_taxi_reason);
  });

  it(`Should be null, Motor cannot change Incident_taxi_reason`, async () => {
    const apiKeyMotor = await getImmutableUserApiKey(UserRole.Motor);
    const hailId = await setupNewHailReceivedByTaxi();
    await operatorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI);
    await motorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_CUSTOMER);
    const hailUpdated = await updateHailIncidentTaxiReason(hailId, 'traffic', apiKeyMotor);

    const hail = await operatorGetHail(hailId);

    assert.isNull(hail.body.data[0].incident_taxi_reason);
    assert.strictEqual(hail.body.data[0].incident_taxi_reason, hailUpdated.body.data[0].incident_taxi_reason);
  });

  it('Operator can set taxi_phone_number any moment before status finished', async () => {
    const hailId = await setupNewHailReceivedByTaxi();
    await operatorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI);

    const hailUpdatedPhone1 = await operatorUpdateTaxiPhone(hailId, '999-999999');

    assert.strictEqual(hailUpdatedPhone1.body.data[0].taxi_phone_number, '999-999999');

    await motorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_CUSTOMER);

    const hailUpdatedPhone2 = await operatorUpdateTaxiPhone(hailId, '888-888888');

    assert.strictEqual(hailUpdatedPhone2.body.data[0].taxi_phone_number, '888-888888');
  });

  it(`Should be null, Motor cannot change taxi_phone_number`, async () => {
    const apiKeyMotor = await getImmutableUserApiKey(UserRole.Motor);
    const hailId = await setupNewHailReceivedByTaxi();

    await updateHailTaxiPhoneNumber(hailId, '888-888888', apiKeyMotor);
    const hail = await operatorGetHail(hailId);

    assert.strictEqual(hail.body.data[0].taxi_phone_number, '514 302-3022');
  });
}

async function operatorUpdateReportingCustomer(
  hailId: string,
  reportingCustomer: boolean,
  reportingCustomerReason?: string
) {
  const apiKey = await getImmutableUserApiKey(UserRole.Operator);
  return await updateHailReportingCustomer(hailId, reportingCustomer, apiKey, reportingCustomerReason);
}

function testCreateHailUserAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to create a Hail`, async () => {
    const dtoCreate = copyHailTemplate();
    const apiKey = await getImmutableUserApiKey(role);
    const apiKeyOperator = await getImmutableUserApiKey(UserRole.Operator);

    const taxi = await setupNewTaxi();

    dtoCreate.data[0].operateur = taxi.body.data[0].operator;
    dtoCreate.data[0].taxi_id = taxi.body.data[0].id;

    await setPositionTaxi(taxi.body.data[0].id, taxi.body.data[0].operator, 'free', apiKeyOperator);
    const response = await postHail(dtoCreate, apiKey);

    assert.strictEqual(response.status, StatusCodes.CREATED);
  });
}

function testGetHailUserAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to get a Hail`, async () => {
    const apiKeyOperator = await getImmutableUserApiKey(UserRole.Operator);
    const dtoCreate = copyHailTemplate();
    const taxi = await setupNewTaxi();

    dtoCreate.data[0].operateur = taxi.body.data[0].operator;
    dtoCreate.data[0].taxi_id = taxi.body.data[0].id;

    await setPositionTaxi(taxi.body.data[0].id, taxi.body.data[0].operator, 'free', apiKeyOperator);

    const hailCreated = await postHail(dtoCreate);

    const apiKey = await getImmutableUserApiKey(role);
    const hail = await getHail(hailCreated.body.data[0].id, apiKey);

    assert.isNotNull(hail.body.data[0].id);
  });
}

async function assertTaxiPositionWhenActiveStatus(hailId: string) {
  const apiKeyOperator = await getImmutableUserApiKey(UserRole.Operator);
  const hail = await getHail(hailId, apiKeyOperator);

  assert.isNotNull(hail.body.data[0].taxi.last_update);
  assert.isNotNull(hail.body.data[0].taxi.position.lat);
  assert.isNotNull(hail.body.data[0].taxi.position.lon);
}

async function testRatingTaxiAccumulated(taxiDto: any, rating: number, average: number) {
  const hailId = await setupNewHailReceivedByTaxi(null, null, taxiDto);
  await operatorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI);
  await motorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_CUSTOMER);
  await operatorUpdatesHailStatus(hailId, StatusHail.CUSTOMER_ON_BOARD);
  await operatorUpdatesHailStatus(hailId, StatusHail.FINISHED);

  await motorUpdateRating(hailId, rating);

  const updatedRating = await operatorGetTaxiRating(hailId);
  assert.equal(updatedRating, average);
}

async function updateHailReportingCustomer(
  hailId: string,
  reportingCustomer: boolean,
  apiKey: string,
  reportingCustomerReason?: string
) {
  const hailRating = copyHailReportingCustomer(x => {
    x.data[0].reporting_customer = reportingCustomer;
    x.data[0].reporting_customer_reason = reportingCustomerReason;
  });

  await putHail(hailRating, hailId, apiKey);

  return await getHail(hailId, apiKey);
}

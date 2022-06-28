// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { shouldThrow } from '../shared/commonTests/testUtil';
import { UserRole } from '../shared/commonTests/UserRole';
import { getTaxiById } from '../taxis/taxi.apiClient';
import { copyTaxiTemplate } from '../taxis/taxisDto.template';
import { createNonImmutableUser, getImmutableUserApiKey } from '../users/user.sharedFixture';
import { IHail } from './../shared/taxiRegistryDtos/taxiRegistryDtos';
import { getHail, postHail, putHail } from './hail.apiClient';
import { StatusHail } from './hail.enum';
import {
  createOperatorForHail,
  operatorUpdatesHailStatus,
  operatorUpdateTaxiPhone,
  setPositionTaxi,
  setupNewHailFinished,
  setupNewHailReceivedByTaxi,
  setupNewTaxi,
  setupNewTaxiForHail,
  updateHailRatingRide
} from './hail.fixture';
import { copyHailStatusTemplate, copyHailTemplate } from './hailDto.template';

// tslint:disable-next-line:max-func-body-length
export async function invalidHailTests(): Promise<void> {
  testCreateHailUserAccessInvalid(UserRole.Operator);
  testCreateHailUserAccessInvalid(UserRole.Inspector);
  testCreateHailUserAccessInvalid(UserRole.Manager);
  testCreateHailUserAccessInvalid(UserRole.Stats);
  testCreateHailUserAccessInvalid(UserRole.Prefecture);

  testGetHailUserAccessInvalid(UserRole.Prefecture);
  testGetHailUserAccessInvalid(UserRole.Stats);
  testGetHailUserAccessInvalid(UserRole.Inspector);

  it('Should be an error 400, operator hail endpoint production is null', async () => {
    const dtoCreate = await initHailTemplateWithoutEndpoint();

    await shouldThrow(
      () => postHail(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'cannot receive hails');
      }
    );
  });

  it('Should be an error 400 Customer_id is not anonymous', async () => {
    const dtoCreate = await initHailTemplateWithNewTaxiWithPosition();
    dtoCreate.data[0].customer_id = 'Not Anonymous';
    await shouldThrow(
      () => postHail(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'The customer_id must be anonymous');
      }
    );
  });

  it('Should be an error 400, Taxi is not available when status is off', async () => {
    const dtoCreate = await initHailTemplateWithTaxiStatusOff();

    await shouldThrow(
      () => postHail(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'The taxi is not available');
      }
    );
  });

  it('Should be an error 400 taxi_id is empty string', async () => {
    const dtoCreate = await initHailTemplateWithNewTaxiWithPosition();
    dtoCreate.data[0].taxi_id = '';
    await shouldThrow(
      () => postHail(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          'The object failed the validation because taxi_id should not be empty'
        );
      }
    );
  });

  it('Should be an error 400 taxi_id is null', async () => {
    const dtoCreate = await initHailTemplateWithNewTaxiWithPosition();
    dtoCreate.data[0].taxi_id = null;
    await shouldThrow(
      () => postHail(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'taxi_id should not be null or undefined');
      }
    );
  });

  it('Should be an error 400 taxi_id does not exists', async () => {
    const dtoCreate = await initHailTemplateWithNewTaxiWithPosition();
    dtoCreate.data[0].taxi_id = 'Not-Exists';
    await shouldThrow(
      () => postHail(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
      }
    );
  });

  it('Should be an error 400, customer_lat not be a number', async () => {
    const dtoCreate = await initHailTemplateWithNewTaxiWithPosition();
    const lat: any = 'NaN';
    dtoCreate.data[0].customer_lat = lat;
    await shouldThrow(
      () => postHail(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          'The object failed the validation because customer_lat must be a number'
        );
      }
    );
  });

  it('Should be an error 400, customer_lat is null', async () => {
    const dtoCreate = await initHailTemplateWithNewTaxiWithPosition();
    dtoCreate.data[0].customer_lat = null;
    await shouldThrow(
      () => postHail(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'customer_lat should not be null or undefined');
      }
    );
  });

  it('Should be an error 400, customer_lon is null', async () => {
    const dtoCreate = await initHailTemplateWithNewTaxiWithPosition();
    dtoCreate.data[0].customer_lon = null;
    await shouldThrow(
      () => postHail(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'customer_lon should not be null or undefined');
      }
    );
  });

  it('Should be an error 400, customer_lon not be a number', async () => {
    const dtoCreate = await initHailTemplateWithNewTaxiWithPosition();
    const lon: any = 'NaN';
    dtoCreate.data[0].customer_lon = lon;
    await shouldThrow(
      () => postHail(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          'The object failed the validation because customer_lon must be a number'
        );
      }
    );
  });

  it('Should be an error 400, taxi_id is undefined', async () => {
    const dtoCreate = await initHailTemplateWithNewTaxiWithPosition();
    dtoCreate.data[0].taxi_id = undefined;
    await shouldThrow(
      () => postHail(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'taxi_id should not be null or undefined');
      }
    );
  });

  it('Should be an error 400, customer_lat is undefined', async () => {
    const dtoCreate = await initHailTemplateWithNewTaxiWithPosition();
    dtoCreate.data[0].customer_lat = undefined;
    await shouldThrow(
      () => postHail(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'customer_lat should not be null or undefined');
      }
    );
  });
  it('Should be an error 400, customer_lon is undefined', async () => {
    const dtoCreate = await initHailTemplateWithNewTaxiWithPosition();
    dtoCreate.data[0].customer_lon = undefined;
    await shouldThrow(
      () => postHail(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'customer_lon should not be null or undefined');
      }
    );
  });

  it('Should be an error 400, Taxi is not available', async () => {
    const dtoCreate = await initHailTemplateWithNewTaxiWithoutPosition();
    await shouldThrow(
      () => postHail(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'The taxi is not available');
      }
    );
  });

  it(`Should return 400 Bad Request, when hailing from YUL/airport`, async () => {
    // Airport Montreal, 7 Roméo-Vachon Blvd N, Dorval, Quebec H4Y 1H1
    const montrealAirportTerminal = { latitude: 45.457659, longitude: -73.7507184 };
    const expectedResponseMessage = `Searching or hailing a taxi from the Montreal airport (YUL) zone is prohibited.`;

    const dtoCreate = await initHailTemplateWithNewTaxiWithoutPosition();
    dtoCreate.data[0].customer_lat = montrealAirportTerminal.latitude;
    dtoCreate.data[0].customer_lon = montrealAirportTerminal.longitude;

    await shouldThrow(
      () => postHail(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(err.response.body.error.message, expectedResponseMessage);
      }
    );
  });

  it('Should be an error 401, Only the operator to which the hail was sent can read the hail', async () => {
    const otherUserOperator = await createNonImmutableUser(UserRole.Operator, true);
    const taxi = await setupNewTaxi();
    const dtoCreate = copyHailTemplate();
    dtoCreate.data[0].operateur = taxi.body.data[0].operator;
    dtoCreate.data[0].taxi_id = taxi.body.data[0].id;

    const apiKeyOperator = await getImmutableUserApiKey(UserRole.Operator);
    await setPositionTaxi(taxi.body.data[0].id, taxi.body.data[0].operator, 'free', apiKeyOperator);

    const hailCreated = await postHail(dtoCreate);
    await shouldThrow(
      () => getHail(hailCreated.body.data[0].id, otherUserOperator.apikey),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.include(err.response.body.error.message, `You don't have the authorization to treat this hail`);
      }
    );
  });

  it('Should be an error 401, Only the motor that created the hail can read the hail', async () => {
    const dtoCreate = copyHailTemplate();
    const taxi = await setupNewTaxi();
    const otherUserMotor = await createNonImmutableUser(UserRole.Motor, true);
    dtoCreate.data[0].operateur = taxi.body.data[0].operator;
    dtoCreate.data[0].taxi_id = taxi.body.data[0].id;

    const apiKeyOperator = await getImmutableUserApiKey(UserRole.Operator);
    await setPositionTaxi(taxi.body.data[0].id, taxi.body.data[0].operator, 'free', apiKeyOperator);
    const hailCreated = await postHail(dtoCreate);
    await shouldThrow(
      () => getHail(hailCreated.body.data[0].id, otherUserMotor.apikey),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.include(err.response.body.error.message, `You don't have the authorization to treat this hail`);
      }
    );
  });

  it('Should be an error 401, Only the operator to which the hail was sent can update the hail', async () => {
    const otherUserOperator = await createNonImmutableUser(UserRole.Operator, true);
    const hailId = await setupNewHailReceivedByTaxi();

    await shouldThrow(
      () => updateHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI, otherUserOperator.apikey),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.include(err.response.body.error.message, `You don't have the authorization to treat this hail`);
      }
    );
  });

  it('Should be an error 401, Only the motor to which the hail was sent can update the hail', async () => {
    const otherUserMotor = await createNonImmutableUser(UserRole.Motor, true);
    const hailId = await setupNewHailReceivedByTaxi();
    await operatorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI);

    await shouldThrow(
      () => updateHailStatus(hailId, StatusHail.ACCEPTED_BY_CUSTOMER, otherUserMotor.apikey),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.include(err.response.body.error.message, `You don't have the authorization to treat this hail`);
      }
    );
  });

  it('Should be an error 400, status does not correspond with transition', async () => {
    const apiKeyOperator = await getImmutableUserApiKey(UserRole.Operator);
    const hailId = await setupNewHailReceivedByTaxi();

    await shouldThrow(
      () => updateHailStatus(hailId, StatusHail.FINISHED, apiKeyOperator),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, `not reachable`);
        assert.include(err.response.body.error.message, StatusHail.RECEIVED_BY_TAXI);
        assert.include(err.response.body.error.message, StatusHail.FINISHED);
      }
    );
  });

  it('Should be an error 401, Only the Operator must be set ACCEPTED_BY_TAXI status', async () => {
    const apiKeyMotor = await getImmutableUserApiKey(UserRole.Motor);
    const hailId = await setupNewHailReceivedByTaxi();

    await shouldThrow(
      () => updateHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI, apiKeyMotor),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.include(err.response.body.error.message, `should not set this status`);
      }
    );
  });

  it('Should be an error 400, hail id does not exists to update', async () => {
    const apiKeyOperator = await getImmutableUserApiKey(UserRole.Operator);
    await await shouldThrow(
      () => updateHailStatus('WrongId', StatusHail.ACCEPTED_BY_TAXI, apiKeyOperator),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, `WrongId`);
        assert.include(err.response.body.error.message, `does not exist`);
      }
    );
  });

  it('Should be an error 401, Only the Motor must be set ACCEPTED_BY_CUSTOMER status', async () => {
    const apiKeyOperator = await getImmutableUserApiKey(UserRole.Operator);

    const hailId = await setupNewHailReceivedByTaxi();
    await updateHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI, apiKeyOperator);
    await shouldThrow(
      () => updateHailStatus(hailId, StatusHail.ACCEPTED_BY_CUSTOMER, apiKeyOperator),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.include(err.response.body.error.message, `should not set this status`);
      }
    );
  });

  it('Should be an error 401, Only the Motor must be set rating_ride', async () => {
    const apiKeyOperator = await getImmutableUserApiKey(UserRole.Operator);
    const hailId = await setupNewHailReceivedByTaxi();

    await shouldThrow(
      () => updateHailRatingRide(hailId, 4, apiKeyOperator),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.include(err.response.body.error.message, `Only Motor must be set Rating ride`);
      }
    );
  });

  it('Should be an error 400, operator cannot set taxi phone number when status finished', async () => {
    const hailId = await setupNewHailFinished();

    await await shouldThrow(
      () => operatorUpdateTaxiPhone(hailId, '999-9999999'),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, `Once finished, a hail cannot be updated by the operator`);
      }
    );
  });

  it('Should be an error 401, only the System can set a timeout state', async () => {
    const apiKeyOperator = await getImmutableUserApiKey(UserRole.Operator);
    const hailId = await setupNewHailReceivedByTaxi();
    await updateHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI, apiKeyOperator);

    await shouldThrow(
      () => updateHailStatus(hailId, StatusHail.TIMEOUT_CUSTOMER, apiKeyOperator),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
      }
    );
  });

  it('Should be an error 401, Only the operator must be set status ACCEPTED_BY_TAXI', async () => {
    const apiKeyMotor = await getImmutableUserApiKey(UserRole.Motor);
    const hailId = await setupNewHailReceivedByTaxi();
    await shouldThrow(
      () => updateHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI, apiKeyMotor),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
      }
    );
  });
}

function testCreateHailUserAccessInvalid(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to create a Hail`, async () => {
    const dtoCreate = copyHailTemplate();
    const apiKey = await getImmutableUserApiKey(role);

    const taxi = await setupNewTaxi();

    dtoCreate.data[0].operateur = taxi.body.data[0].operator;
    dtoCreate.data[0].taxi_id = taxi.body.data[0].id;

    const apiKeyOperator = await getImmutableUserApiKey(UserRole.Operator);
    await setPositionTaxi(taxi.body.data[0].id, taxi.body.data[0].operator, 'free', apiKeyOperator);
    await shouldThrow(
      () => postHail(dtoCreate, apiKey),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.strictEqual(
          err.response.body.error.message,
          'The user has a role which has insufficient permissions to access this resource.'
        );
      }
    );
  });
}

function testGetHailUserAccessInvalid(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to get a Hail`, async () => {
    const dtoCreate = copyHailTemplate();
    const taxi = await setupNewTaxi();

    dtoCreate.data[0].operateur = taxi.body.data[0].operator;
    dtoCreate.data[0].taxi_id = taxi.body.data[0].id;

    const apiKeyOperator = await getImmutableUserApiKey(UserRole.Operator);
    await setPositionTaxi(taxi.body.data[0].id, taxi.body.data[0].operator, 'free', apiKeyOperator);
    const hailCreated = await postHail(dtoCreate);
    const apiKey = await getImmutableUserApiKey(role);

    await shouldThrow(
      () => getHail(hailCreated.body.data[0].id, apiKey),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.strictEqual(
          err.response.body.error.message,
          'The user has a role which has insufficient permissions to access this resource.'
        );
      }
    );
  });
}

async function updateHailStatus(hailId: string, status: StatusHail, apiKey?: string) {
  const hailStatus = copyHailStatusTemplate(x => {
    x.data[0].status = status;
  });
  return await putHail(hailStatus, hailId, apiKey);
}

async function initHailTemplateWithNewTaxiWithPosition(): Promise<IHail> {
  const dtoCreate = copyHailTemplate();
  const taxi = await setupNewTaxi();
  dtoCreate.data[0].operateur = taxi.body.data[0].operator;
  dtoCreate.data[0].taxi_id = taxi.body.data[0].id;

  const apiKeyOperator = await getImmutableUserApiKey(UserRole.Operator);
  await setPositionTaxi(taxi.body.data[0].id, taxi.body.data[0].operator, 'free', apiKeyOperator);

  return dtoCreate;
}

async function initHailTemplateWithNewTaxiWithoutPosition(): Promise<IHail> {
  const dtoTaxi = copyTaxiTemplate(x => {
    x.data[0].status = 'free';
    x.data[0].private = false;
  });

  const taxiSetup = await setupNewTaxiForHail(dtoTaxi);
  const taxi = await getTaxiById(taxiSetup.body.data[0].id);

  const dtoCreate = copyHailTemplate();

  dtoCreate.data[0].operateur = taxi.body.data[0].operator;
  dtoCreate.data[0].taxi_id = taxi.body.data[0].id;

  return dtoCreate;
}

export async function initHailTemplateWithTaxiStatusOff() {
  const dtoCreate = copyHailTemplate();
  const apiKeyOperator = await getImmutableUserApiKey(UserRole.Operator);
  const taxi = await setupNewTaxi(apiKeyOperator, 'off');
  dtoCreate.data[0].operateur = taxi.body.data[0].operator;
  dtoCreate.data[0].taxi_id = taxi.body.data[0].id;

  await setPositionTaxi(taxi.body.data[0].id, taxi.body.data[0].operator, 'off', apiKeyOperator);

  return dtoCreate;
}

async function initHailTemplateWithoutEndpoint() {
  const operator = await createOperatorForHail();
  const dtoCreate = copyHailTemplate();
  const taxi = await setupNewTaxi(operator.apikey);
  dtoCreate.data[0].operateur = taxi.body.data[0].operator;
  dtoCreate.data[0].taxi_id = taxi.body.data[0].id;

  await setPositionTaxi(taxi.body.data[0].id, taxi.body.data[0].operator, 'free', operator.apikey);

  return dtoCreate;
}

// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { configs } from '../../config/configs';
import { createAds } from '../ads/ads.apiClient';
import { createDriver } from '../drivers/driver.apiClient';
import { aFewSeconds, getCurrentUnixTime } from '../shared/commonTests/testUtil';
import { UserRole } from '../shared/commonTests/UserRole';
import { defineUntilNextTimeSlotStarts } from '../shared/dataDumps/timeSlot';
import { IHail, ITaxi } from '../shared/taxiRegistryDtos/taxiRegistryDtos';
import { postTaxiPositionSnapshots } from '../taxiPositionSnapShots/taxiPositionSnapshots.apiClient';
import { getTaxiById, postTaxi } from '../taxis/taxi.apiClient';
import { copyTaxiTemplate } from '../taxis/taxisDto.template';
import { createOperatorWithPromotion, getImmutableUserApiKey } from '../users/user.sharedFixture';
import { createVehicle } from '../vehicles/vehicle.apiClient';
import { IAds } from './../shared/taxiRegistryDtos/taxiRegistryDtos';
import { copyTaxiPositionTemplate } from './../taxiPositionSnapShots/taxiPositionSnapShotsDto.template';
import { getHail, postHail, putHail } from './hail.apiClient';
import { StatusHail } from './hail.enum';
import {
  copyHailIncidentTaxiReason,
  copyHailRatingTemplate,
  copyHailStatusTemplate,
  copyHailTaxiPhoneNumber,
  copyHailTemplate
} from './hailDto.template';

export async function setupNewHail(hailDto?: IHail, apiKey?: string, taxi?: any) {
  const taxiOrDefault = taxi ? taxi : await setupNewTaxi(apiKey);
  const taxiId = taxiOrDefault.body.data[0].id;
  const taxiOperator = taxiOrDefault.body.data[0].operator;

  await setPositionTaxi(taxiId, taxiOperator, 'free', apiKey);

  const hailDtoOrDefault = hailDto ? hailDto : copyHailTemplate();
  hailDtoOrDefault.data[0].taxi_id = taxiId;
  hailDtoOrDefault.data[0].operateur = taxiOperator;
  return await postHail(hailDtoOrDefault);
}

export async function setupNewHailId(hailDto?: IHail, apiKey?: string, taxi?: any) {
  const responseHailPost = await setupNewHail(hailDto, apiKey, taxi);
  return responseHailPost.body.data[0].id;
}

export async function setupNewHailReceivedByTaxi(hailDto?: IHail, apiKey?: string, taxi?: any) {
  const hailId = await setupNewHailId(hailDto, apiKey, taxi);
  await aFewSeconds(configs.hails.delayToReachStatusReceived_by_operatorInSec);
  await operatorUpdatesHailStatus(hailId, StatusHail.RECEIVED_BY_TAXI);
  return hailId;
}

export async function setupNewHailFinished(hailDto?: IHail, apiKey?: string) {
  const hailId = await setupNewHailReceivedByTaxi(hailDto, apiKey);
  await operatorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI);
  await motorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_CUSTOMER);
  await operatorUpdatesHailStatus(hailId, StatusHail.CUSTOMER_ON_BOARD);
  await operatorUpdatesHailStatus(hailId, StatusHail.FINISHED);
  return hailId;
}

export async function operatorGetHail(hailId: string) {
  const apiKey = await getImmutableUserApiKey(UserRole.Operator);
  return await getHail(hailId, apiKey);
}

export async function motorGetHail(hailId: string) {
  const apiKey = await getImmutableUserApiKey(UserRole.Motor);
  return await getHail(hailId, apiKey);
}

export async function setupNewTaxi(apiKey?: string, statusTaxi = 'free') {
  const dtoTaxi = copyTaxiTemplate(x => {
    x.data[0].status = statusTaxi;
    x.data[0].private = false;
  });
  const taxiSetup = await setupNewTaxiForHail(dtoTaxi, apiKey);
  const taxi = await getTaxiById(taxiSetup.body.data[0].id, apiKey);
  return taxi;
}

export async function setPositionTaxi(taxiId: string, user: string, statusTaxi: string, apiKey?: string) {
  const dtoPositionSnapShot = copyTaxiPositionTemplate(x => {
    x.items[0].timestamp = getCurrentUnixTime();
    x.items[0].operator = user;
    x.items[0].taxi = taxiId;
    x.items[0].lat = 45.511942;
    x.items[0].lon = -73.570064;
    x.items[0].device = 'phone';
    x.items[0].status = statusTaxi;
    x.items[0].version = '2';
    x.items[0].speed = '50';
    x.items[0].azimuth = '180';
  });

  await postTaxiPositionSnapshots(dtoPositionSnapShot, apiKey);
}

export async function createOperatorForHail(url?: string) {
  const promotions = { standard: true, minivan: true, special_need: true };
  return await createOperatorWithPromotion(promotions, url);
}

export async function setupNewTaxiForHail(dtoTaxi: ITaxi, apiKey?: string) {
  const [driver, vehicle] = await Promise.all([createDriver(apiKey), createVehicle(apiKey)]);

  const ads: IAds = await createCustomAds(apiKey);

  dtoTaxi.data[0].ads.insee = ads.data[0].insee;
  dtoTaxi.data[0].ads.numero = ads.data[0].numero;
  dtoTaxi.data[0].driver.departement = driver.data[0].departement.numero;
  dtoTaxi.data[0].driver.professional_licence = driver.data[0].professional_licence;
  dtoTaxi.data[0].vehicle.licence_plate = vehicle.data[0].licence_plate;

  return await postTaxi(dtoTaxi, apiKey);
}

async function createCustomAds(apiKey?: string) {
  return createAds(apiKey);
}

export async function updateHailTaxiPhoneNumber(hailId: string, phoneNumber: string, apiKey: string) {
  const hailTaxiPhone = copyHailTaxiPhoneNumber(x => {
    x.data[0].taxi_phone_number = phoneNumber;
  });
  await putHail(hailTaxiPhone, hailId, apiKey);

  return await getHail(hailId, apiKey);
}

export async function updateHailIncidentTaxiReason(hailId: string, reason: string, apiKey: string) {
  const hailIncidenReason = copyHailIncidentTaxiReason(x => {
    x.data[0].incident_taxi_reason = reason;
  });
  await putHail(hailIncidenReason, hailId, apiKey);

  return await getHail(hailId, apiKey);
}

export async function operatorGetTaxiRating(hailId: string) {
  await aFewSeconds(configs.hails.delayToComputeTaxiRatingInSec);
  const hail = await operatorGetHail(hailId);
  return hail.body.data[0].taxi_relation.rating;
}

export async function updateHailRatingRide(
  hailId: string,
  ratingRide: number,
  apiKey: string,
  ratingRideReason?: string
) {
  const hailRating = copyHailRatingTemplate(x => {
    x.data[0].rating_ride = ratingRide;
    x.data[0].rating_ride_reason = ratingRideReason;
  });

  await putHail(hailRating, hailId, apiKey);

  return await getHail(hailId, apiKey);
}

export async function motorUpdateRating(hailId: string, ratingRide: number, ratingRideReason?: string) {
  const apiKey = await getImmutableUserApiKey(UserRole.Motor);
  return await updateHailRatingRide(hailId, ratingRide, apiKey, ratingRideReason);
}

export async function motorUpdatesHailStatus(hailId: string, status: StatusHail, unSuccessfulStatus?: StatusHail) {
  const apiKey = await getImmutableUserApiKey(UserRole.Motor);
  return await updatesHailStatus(hailId, status, apiKey, unSuccessfulStatus);
}

export async function operatorUpdatesHailStatus(
  hailId: string,
  status: StatusHail,
  unSuccessfulStatus?: StatusHail,
  incidentReason?: string
) {
  const apiKey = await getImmutableUserApiKey(UserRole.Operator);
  return await updatesHailStatus(hailId, status, apiKey, unSuccessfulStatus, incidentReason);
}

export async function updatesHailStatus(
  hailId: string,
  status: StatusHail,
  apiKey: string,
  unSuccessfulStatus?: StatusHail,
  incidentReason?: string
) {
  const hailStatus = copyHailStatusTemplate(x => {
    x.data[0].status = status;
    x.data[0].incident_taxi_reason = incidentReason;
  });
  const responseUpdate = await putHail(hailStatus, hailId, apiKey);
  assert.strictEqual(responseUpdate.status, StatusCodes.OK);
  assert.strictEqual(responseUpdate.body.data[0].status, unSuccessfulStatus ? unSuccessfulStatus : status);
  assert.equal(responseUpdate.body.data[0].incident_taxi_reason, incidentReason);
}

export async function operatorUpdateTaxiPhone(hailId: string, phoneNumber: string) {
  const apiKey = await getImmutableUserApiKey(UserRole.Operator);
  return await updateHailTaxiPhoneNumber(hailId, phoneNumber, apiKey);
}

export async function operatorUpdateIncidentTaxiReason(hailId: string, reason: string, apiKey: string) {
  return await updateHailIncidentTaxiReason(hailId, reason, apiKey);
}

export async function hailtoStatusDeclinedByTaxi() {
  const dtoCreate = copyHailTemplate();
  const hailId = await setupNewHailReceivedByTaxi(dtoCreate);

  await operatorUpdatesHailStatus(hailId, StatusHail.DECLINED_BY_TAXI);

  return await operatorGetHail(hailId);
}

export const untilNextHailTimeSlotStarts = defineUntilNextTimeSlotStarts(configs.hails.dataDumpPeriodInSec);

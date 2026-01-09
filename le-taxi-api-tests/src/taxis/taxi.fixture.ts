// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { createAds, postAds } from "../ads/ads.apiClient";
import {
  copyAdsOwnerTemplate,
  copyAdsPermitTemplate,
} from "../ads/adsDto.template";
import { createDriver, postDriver } from "../drivers/driver.apiClient";
import { copyDriverTemplate } from "../drivers/driverDto.template";
import { ITaxi } from "../shared/taxiRegistryDtos/taxiRegistryDtos";
import { createVehicle, postVehicle } from "../vehicles/vehicle.apiClient";
import { copyVehicleTemplate } from "../vehicles/vehiclesDto.template";
import { postTaxi, putTaxi } from "./taxi.apiClient";
import { copyTaxiTemplate } from "./taxisDto.template";

export async function setupNewTaxiId(
  dtoTaxi: ITaxi,
  apiKey?: string,
): Promise<any> {
  const response = await setupNewTaxi(dtoTaxi, apiKey);
  return response.body.data[0].id;
}

export async function setupNewTaxi(
  dtoTaxi: ITaxi,
  apiKey?: string,
): Promise<any> {
  const [driver, vehicle, ads] = await Promise.all([
    createDriver(apiKey),
    createVehicle(apiKey),
    createAds(apiKey),
  ]);
  return createTaxi({ ads, driver, vehicle, taxi: dtoTaxi }, apiKey);
}

export async function setupNewCustomTaxi(
  specialNeedVehicle = false,
  type = "sedan",
  apiKey?: string,
) {
  const [driver, vehicle, ads] = await Promise.all([
    createDriver(apiKey),
    createCustomVehicle(specialNeedVehicle, type, apiKey),
    createAds(apiKey),
  ]);
  return createTaxi({ ads, driver, vehicle, taxi: copyTaxiTemplate() }, apiKey);
}

async function createTaxi(
  triplet: { ads: any; driver: any; vehicle: any; taxi: ITaxi },
  apiKey?: string,
) {
  const { ads, driver, vehicle, taxi } = triplet;

  const dtoTaxi = taxi || copyTaxiTemplate();
  dtoTaxi.data[0].ads.insee = ads.data[0].insee;
  dtoTaxi.data[0].ads.numero = ads.data[0].numero;
  dtoTaxi.data[0].driver.departement = driver.data[0].departement.numero;
  dtoTaxi.data[0].driver.professional_licence =
    driver.data[0].professional_licence;
  dtoTaxi.data[0].vehicle.licence_plate = vehicle.data[0].licence_plate;

  return await postTaxi(dtoTaxi, apiKey);
}

async function createCustomVehicle(
  specialNeedVehicle = false,
  type = "sedan",
  apiKey?: string,
) {
  return createVehicle(apiKey, (x) => {
    x.data[0].fresh_drink = true;
    x.data[0].pet_accepted = true;
    x.data[0].type_ = type;
    x.data[0].special_need_vehicle = specialNeedVehicle;
  });
}

export async function initTaxiReferencesWithOwnerSemanticForADS(
  dtoTaxi: ITaxi,
  apiKey?: string,
) {
  await Promise.all([
    postDriver(
      copyDriverTemplate((x) => {
        x.data[0].departement.numero = dtoTaxi.data[0].driver.departement;
        x.data[0].professional_licence =
          dtoTaxi.data[0].driver.professional_licence;
      }),
      apiKey,
    ),
    postVehicle(
      copyVehicleTemplate((x) => {
        x.data[0].licence_plate = dtoTaxi.data[0].vehicle.licence_plate;
      }),
      apiKey,
    ),
    postAds(
      copyAdsOwnerTemplate((x) => {
        x.data[0].insee = dtoTaxi.data[0].ads.insee;
        x.data[0].numero = dtoTaxi.data[0].ads.numero;
      }),
      apiKey,
    ),
  ]);
}

export async function initTaxiReferencesWithPermitSemanticForADS(
  dtoTaxi: ITaxi,
  apiKey?: string,
) {
  await Promise.all([
    postDriver(
      copyDriverTemplate((x) => {
        x.data[0].departement.numero = dtoTaxi.data[0].driver.departement;
        x.data[0].professional_licence =
          dtoTaxi.data[0].driver.professional_licence;
      }),
      apiKey,
    ),
    postVehicle(
      copyVehicleTemplate((x) => {
        x.data[0].licence_plate = dtoTaxi.data[0].vehicle.licence_plate;
      }),
      apiKey,
    ),
    postAds(
      copyAdsPermitTemplate((x) => {
        x.data[0].insee = dtoTaxi.data[0].ads.insee;
        x.data[0].numero = dtoTaxi.data[0].ads.numero;
      }),
      apiKey,
    ),
  ]);
}

export async function setupStatus(taxiId: string, status: string) {
  const positionUpdateDto = copyTaxiTemplate((x) => {
    x.data[0].status = status;
  });

  return await putTaxi(positionUpdateDto, taxiId);
}

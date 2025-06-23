// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from "chai";
import { StatusCodes } from "http-status-codes";

import { generateAutoNumeroAds, postAds } from "../ads/ads.apiClient";
import {
  copyAdsOwnerTemplate,
  departementWithOwnerSemanticForADS,
  departementWithPermitSemanticForADS,
  inseeWithOwnerSemanticForADS,
  inseeWithPermitSemanticForADS,
} from "../ads/adsDto.template";
import {
  getProfessionalLicence,
  postDriver,
} from "../drivers/driver.apiClient";
import { copyDriverTemplate } from "../drivers/driverDto.template";
import { getCurrentUnixTime } from "../shared/commonTests/testUtil";
import { UserRole } from "../shared/commonTests/UserRole";
import { postTaxiPositionSnapshots } from "../taxiPositionSnapShots/taxiPositionSnapshots.apiClient";
import { copyTaxiPositionTemplate } from "../taxiPositionSnapShots/taxiPositionSnapShotsDto.template";
import {
  createNonImmutableUser,
  getImmutableUserApiKey,
} from "../users/user.sharedFixture";
import {
  generateCommercialLicencePlate,
  generateLegacyLicencePlate,
  generateStandardLicencePlate,
  postVehicle,
} from "../vehicles/vehicle.apiClient";
import { copyVehicleTemplate } from "../vehicles/vehiclesDto.template";
import { getTaxiById, postTaxi, putTaxi } from "./taxi.apiClient";
import {
  initTaxiReferencesWithOwnerSemanticForADS,
  initTaxiReferencesWithPermitSemanticForADS,
  setupNewTaxi,
  setupNewTaxiId,
} from "./taxi.fixture";
import { responseObjectModel } from "./taxi.responseDto";
import {
  copyPutTaxiRequestTemplate,
  copyTaxiTemplate,
} from "./taxisDto.template";

// eslint-disable-next-line max-lines-per-function
export async function crudTaxiTests(): Promise<void> {
  testCreateTaxiUserAccessValid(UserRole.Admin);
  testCreateTaxiUserAccessValid(UserRole.Operator);

  it("Can create a taxi directly from template", async () => {
    const dtoCreate = copyTaxiTemplate();
    const response = await setupNewTaxi(dtoCreate);
    assert.strictEqual(response.status, StatusCodes.CREATED);
  });

  it("Should return expected data/format", async () => {
    const dtoCreate = copyTaxiTemplate();

    const response = await setupNewTaxi(dtoCreate);
    assert.strictEqual(response.status, StatusCodes.CREATED);
    const responseItem = response.body.data[0];

    assert.containsAllDeepKeys(responseItem, responseObjectModel);
    assert.isString(responseItem.ads.insee);
    assert.isString(responseItem.ads.numero);
    assert.isNull(responseItem.crowfly_distance, null);
    assert.isString(responseItem.driver.departement);
    assert.isString(responseItem.driver.professional_licence);
    assert.isString(responseItem.id);
    assert.isNull(responseItem.last_update);
    assert.isNull(responseItem.position.lat);
    assert.isNull(responseItem.position.lon);
    assert.isFalse(responseItem.private);
    assert.isNull(responseItem.vehicle.characteristics);
    assert.isString(responseItem.vehicle.licence_plate);
    assert.isString(responseItem.vehicle.model);
    assert.isString(responseItem.operator);
    assert.isNull(responseItem.rating);
    assert.strictEqual(responseItem.status, "off");
    assert.isString(responseItem.vehicle.color);
    assert.isString(responseItem.vehicle.constructor);
    assert.isNumber(responseItem.vehicle.nb_seats);
  });

  it("Cannot alter the driver of another operator", async () => {
    const operatorA = await getImmutableUserApiKey(UserRole.Operator);
    const operatorB = (await createNonImmutableUser(UserRole.Operator)).apikey;
    const sameDto = copyTaxiTemplate((x) => {
      x.data[0].driver.departement = departementWithOwnerSemanticForADS;
      x.data[0].driver.professional_licence = "sameTaxi";
      x.data[0].vehicle.licence_plate = "sameTaxi";
      x.data[0].ads.insee = inseeWithOwnerSemanticForADS;
      x.data[0].ads.numero = "sameTaxi";
    });
    await initTaxiReferencesWithOwnerSemanticForADS(sameDto, operatorA);
    await initTaxiReferencesWithOwnerSemanticForADS(sameDto, operatorB);

    const canCreateMine = await postTaxi(sameDto, operatorA);
    const canUpdateMine = await postTaxi(sameDto, operatorA);
    const cannotUpdateYours = await postTaxi(sameDto, operatorB);
    const butStillCanUpdateMine = await postTaxi(sameDto, operatorB);

    assert.strictEqual(canCreateMine.status, StatusCodes.CREATED);
    assert.strictEqual(canUpdateMine.status, StatusCodes.OK);
    assert.strictEqual(
      canCreateMine.body.data[0].id,
      canUpdateMine.body.data[0].id
    );
    assert.strictEqual(cannotUpdateYours.status, StatusCodes.CREATED);
    assert.strictEqual(butStillCanUpdateMine.status, StatusCodes.OK);
    assert.strictEqual(
      cannotUpdateYours.body.data[0].id,
      butStillCanUpdateMine.body.data[0].id
    );
    assert.notEqual(
      canCreateMine.body.data[0].id,
      cannotUpdateYours.body.data[0].id
    );
  });

  it("POST Accepts request when status is missing", async () => {
    const dtoCreate = copyTaxiTemplate();
    delete dtoCreate.data[0].status;

    const response = await setupNewTaxi(dtoCreate);
    assert.strictEqual(response.status, StatusCodes.CREATED);
  });

  it("POST Attribute status is ignored", async () => {
    const apiKey = await getImmutableUserApiKey(UserRole.Operator);
    const dtoCreate = copyTaxiTemplate();
    let response = await setupNewTaxi(dtoCreate, apiKey);
    assert.strictEqual(response.status, StatusCodes.CREATED);

    const responseItem = response.body.data[0];
    const dtoUpdate = copyTaxiTemplate((x) => {
      const item = x.data[0];
      item.ads.insee = responseItem.ads.insee;
      item.ads.numero = responseItem.ads.numero;
      item.vehicle.licence_plate = responseItem.vehicle.licence_plate;
      item.driver.departement = responseItem.driver.departement;
      item.driver.professional_licence =
        responseItem.driver.professional_licence;
      item.status = "free";
    });
    response = await postTaxi(dtoUpdate, apiKey);
    assert.strictEqual(response.status, StatusCodes.OK);
    assert.notEqual(response.body.data[0].status, "free");

    dtoUpdate.data[0].status = "oncoming";
    response = await postTaxi(dtoUpdate, apiKey);
    assert.strictEqual(response.status, StatusCodes.OK);
    assert.notEqual(response.body.data[0].status, "oncoming");
  });

  it("POST Persists private attribute", async () => {
    const apiKey = await getImmutableUserApiKey(UserRole.Operator);

    const dtoCreateVehicle = copyVehicleTemplate();
    let response = await postVehicle(dtoCreateVehicle, apiKey);
    assert.strictEqual(response.status, StatusCodes.CREATED);
    const licencePlate = response.body.data[0].licence_plate;

    const dtoCreateAds = copyAdsOwnerTemplate();
    response = await postAds(dtoCreateAds, apiKey);
    assert.strictEqual(response.status, StatusCodes.CREATED);
    const insee = response.body.data[0].insee;
    const numero = response.body.data[0].numero;

    const dtoCreateDrvier = copyDriverTemplate();
    response = await postDriver(dtoCreateDrvier, apiKey);
    assert.strictEqual(response.status, StatusCodes.CREATED);
    const departement = response.body.data[0].departement;
    const professionalLicence = response.body.data[0].professional_licence;

    const dtoCreateTaxi = copyTaxiTemplate((x) => {
      const item = x.data[0];
      item.ads.insee = insee;
      item.ads.numero = numero;
      item.driver.departement = departement.numero;
      item.driver.professional_licence = professionalLicence;
      item.vehicle.licence_plate = licencePlate;
      item.private = true;
    });
    response = await postTaxi(dtoCreateTaxi, apiKey);
    assert.strictEqual(response.status, StatusCodes.CREATED);
    assert.strictEqual(response.body.data[0].private, true);

    dtoCreateTaxi.data[0].private = false;
    response = await postTaxi(dtoCreateTaxi, apiKey);
    assert.strictEqual(response.status, StatusCodes.OK);
    assert.strictEqual(response.body.data[0].private, false);
  });

  it("Returns private default value", async () => {
    const apiKey = await getImmutableUserApiKey(UserRole.Operator);

    const dtoCreateVehicle = copyVehicleTemplate();
    let response = await postVehicle(dtoCreateVehicle, apiKey);
    assert.strictEqual(response.status, StatusCodes.CREATED);
    const licencePlate = response.body.data[0].licence_plate;

    const dtoCreateAds = copyAdsOwnerTemplate();
    response = await postAds(dtoCreateAds, apiKey);
    assert.strictEqual(response.status, StatusCodes.CREATED);
    const insee = response.body.data[0].insee;
    const numero = response.body.data[0].numero;

    const dtoCreateDriver = copyDriverTemplate();
    response = await postDriver(dtoCreateDriver, apiKey);
    assert.strictEqual(response.status, StatusCodes.CREATED);
    const departement = response.body.data[0].departement;
    const professionalLicence = response.body.data[0].professional_licence;

    const dtoCreateTaxi = copyTaxiTemplate((x) => {
      const item = x.data[0];
      item.ads.insee = insee;
      item.ads.numero = numero;
      item.driver.departement = departement.numero;
      item.driver.professional_licence = professionalLicence;
      item.vehicle.licence_plate = licencePlate;
    });
    delete dtoCreateTaxi.data[0].private;
    response = await postTaxi(dtoCreateTaxi, apiKey);
    assert.strictEqual(response.status, StatusCodes.CREATED);
    assert.strictEqual(response.body.data[0].private, false);
  });

  it("Returns valid characteristics", async () => {
    const apiKey = await getImmutableUserApiKey(UserRole.Operator);
    const dtoCreate = copyTaxiTemplate();
    let response = await setupNewTaxi(dtoCreate, apiKey);
    assert.strictEqual(response.status, StatusCodes.CREATED);
    let taxiResponseItem = response.body.data[0];

    const dtoVehicleUpdate = copyVehicleTemplate((x) => {
      const item = x.data[0];
      item.licence_plate = taxiResponseItem.vehicle.licence_plate;
      item.nb_seats = 3;
      item.credit_card_accepted = true;
      item.luxury = true;
      item.wifi = true;
      item.dvd_player = true;
      item.horodateur = "horodateur-updated";
      item.color = "color-updated";
      item.constructor = "constructor-updated";
      item.model = "model-updated";
    });
    response = await postVehicle(dtoVehicleUpdate, apiKey);
    assert.strictEqual(response.status, StatusCodes.OK);

    const taxiDtoUpdate = copyTaxiTemplate((x) => {
      const item = x.data[0];
      item.ads.insee = taxiResponseItem.ads.insee;
      item.ads.numero = taxiResponseItem.ads.numero;
      item.vehicle.licence_plate = taxiResponseItem.vehicle.licence_plate;
      item.driver.departement = taxiResponseItem.driver.departement;
      item.driver.professional_licence =
        taxiResponseItem.driver.professional_licence;
    });
    response = await postTaxi(taxiDtoUpdate, apiKey);
    assert.strictEqual(response.status, StatusCodes.OK);
    taxiResponseItem = response.body.data[0];

    assert.strictEqual(taxiResponseItem.vehicle.model, "model-updated");
    assert.strictEqual(
      taxiResponseItem.vehicle.constructor,
      "constructor-updated"
    );
    assert.strictEqual(taxiResponseItem.vehicle.color, "color-updated");
    assert.strictEqual(taxiResponseItem.vehicle.nb_seats, 3);
    assert.lengthOf(taxiResponseItem.vehicle.characteristics, 4);
    assert.include(
      taxiResponseItem.vehicle.characteristics,
      "credit_card_accepted"
    );
    assert.include(taxiResponseItem.vehicle.characteristics, "luxury");
    assert.include(taxiResponseItem.vehicle.characteristics, "wifi");
    assert.include(taxiResponseItem.vehicle.characteristics, "dvd_player");
  });

  it("PUT Can modify private property (with boolean type)", async () => {
    const postDto = copyTaxiTemplate();
    const taxiId = await setupNewTaxiId(postDto);

    const putTaxiDto = {
      data: [
        {
          status: "free",
          private: false,
        },
      ],
    };
    const putResponse1 = await putTaxi(putTaxiDto, taxiId);
    assert.strictEqual(putResponse1.status, StatusCodes.OK);

    const getResponse1 = await getTaxiById(taxiId);
    assert.strictEqual(getResponse1.status, StatusCodes.OK);
    assert.strictEqual(getResponse1.body.data[0].private, false);

    putTaxiDto.data[0].private = true;
    const putResponse2 = await putTaxi(putTaxiDto, taxiId);
    assert.strictEqual(putResponse2.status, StatusCodes.OK);

    const getResponse2 = await getTaxiById(taxiId);
    assert.strictEqual(getResponse2.status, StatusCodes.OK);
    assert.strictEqual(getResponse2.body.data[0].private, true);
  });

  it("PUT private property is optional with false as default", async () => {
    const postDto = copyTaxiTemplate((x) => (x.data[0].private = true));
    const taxiId = await setupNewTaxiId(postDto);

    const putDto = copyPutTaxiRequestTemplate((x) => delete x.data[0].private);
    const putResponse = await putTaxi(putDto, taxiId);
    assert.strictEqual(putResponse.status, StatusCodes.OK);

    const getResponse = await getTaxiById(taxiId);
    assert.strictEqual(getResponse.status, StatusCodes.OK);
    assert.strictEqual(getResponse.body.data[0].private, false);
  });

  it("PUT Can modify private property (with string type)", async () => {
    const postDto = copyTaxiTemplate();
    const taxiId = await setupNewTaxiId(postDto);

    const putTaxiDto = {
      data: [
        {
          status: "free",
          private: "false",
        },
      ],
    };
    const putResponse1 = await putTaxi(putTaxiDto, taxiId);
    assert.strictEqual(putResponse1.status, StatusCodes.OK);

    const getResponse1 = await getTaxiById(taxiId);
    assert.strictEqual(getResponse1.status, StatusCodes.OK);
    assert.strictEqual(getResponse1.body.data[0].private, false);

    putTaxiDto.data[0].private = "true";
    const putResponse2 = await putTaxi(putTaxiDto, taxiId);
    assert.strictEqual(putResponse2.status, StatusCodes.OK);

    const getResponse2 = await getTaxiById(taxiId);
    assert.strictEqual(getResponse2.status, StatusCodes.OK);
    assert.strictEqual(getResponse2.body.data[0].private, true);
  });

  it("PUT Attribute status is ignored", async () => {
    const postDto = copyTaxiTemplate();
    const taxiId = await setupNewTaxiId(postDto);

    const putDto1 = copyPutTaxiRequestTemplate(
      (x) => (x.data[0].status = "free")
    );
    await putTaxi(putDto1, taxiId);
    const getResponse1 = await getTaxiById(taxiId);
    assert.notEqual(getResponse1.body.data[0].status, "free");

    const putDto2 = copyPutTaxiRequestTemplate(
      (x) => (x.data[0].status = "oncoming")
    );
    await putTaxi(putDto2, taxiId);
    const getResponse2 = await getTaxiById(taxiId);
    assert.notEqual(getResponse2.body.data[0].status, "oncoming");
  });

  it("GET Should return expected data/format", async () => {
    const postDto = copyTaxiTemplate();
    const taxiId = await setupNewTaxiId(postDto);

    const getResponse = await getTaxiById(taxiId);
    assert.strictEqual(getResponse.status, StatusCodes.OK);
    const responseItem = getResponse.body.data[0];

    assert.containsAllDeepKeys(responseItem, responseObjectModel);

    assert.strictEqual(responseItem.private, false);

    assert.isString(responseItem.ads.insee);
    assert.isString(responseItem.ads.numero);
    assert.isString(responseItem.driver.professional_licence);
    assert.isString(responseItem.vehicle.licence_plate);
    assert.isString(responseItem.vehicle.model);
    assert.isString(responseItem.id);
    assert.isString(responseItem.driver.departement);
    assert.isString(responseItem.operator);
    assert.isString(responseItem.vehicle.constructor);
    assert.isString(responseItem.vehicle.color);
    assert.isString(responseItem.vehicle.type_);

    assert.isNumber(responseItem.vehicle.nb_seats);

    assert.isNull(responseItem.position.lat);
    assert.isNull(responseItem.position.lon);
    assert.isNull(responseItem.crowfly_distance);
    assert.isNull(responseItem.last_update);

    assert.isNull(responseItem.rating);
    assert.strictEqual(responseItem.status, "off");
    assert.isNull(responseItem.vehicle.characteristics);
  });

  it("GET. Should retrieve the taxi status from the latest position sent", async () => {
    const apiKey = await getImmutableUserApiKey(UserRole.Operator);
    const dtoCreate = copyTaxiTemplate();
    let response = await setupNewTaxi(dtoCreate, apiKey);
    assert.strictEqual(response.status, StatusCodes.CREATED);
    const taxiId = response.body.data[0].id;
    const operator = response.body.data[0].operator;

    const dtoPositionSnapShot = copyTaxiPositionTemplate((x) => {
      const item = x.items[0];
      item.operator = operator;
      item.taxi = taxiId;
      item.status = "oncoming";
      item.timestamp = getCurrentUnixTime();
    });
    response = await postTaxiPositionSnapshots(dtoPositionSnapShot, apiKey);
    assert.strictEqual(response.status, StatusCodes.OK);

    response = await getTaxiById(taxiId, apiKey);
    assert.strictEqual(response.status, StatusCodes.OK);
    const firstTimeStatus = response.body.data[0].status;
    const firstTimeLastUpdate = response.body.data[0].last_update;
    assert.strictEqual(firstTimeStatus, "oncoming");

    dtoPositionSnapShot.items[0].timestamp = firstTimeLastUpdate + 10;
    dtoPositionSnapShot.items[0].status = "free";
    response = await postTaxiPositionSnapshots(dtoPositionSnapShot, apiKey);
    assert.strictEqual(response.status, StatusCodes.OK);

    response = await getTaxiById(taxiId, apiKey);
    assert.strictEqual(response.status, StatusCodes.OK);
    const secondTimeStatus = response.body.data[0].status;
    const secondTimeLastUpdate = response.body.data[0].last_update;
    assert.strictEqual(secondTimeStatus, "free");
    assert.strictEqual(secondTimeLastUpdate, firstTimeLastUpdate + 10);
  });

  it("Should be able to create duplicate taxi (and duplicate triplet) with different operator", async () => {
    const operatorA = await getImmutableUserApiKey(UserRole.Operator);
    const operatorB = (await createNonImmutableUser(UserRole.Operator)).apikey;
    const sameDto = copyTaxiTemplate((x) => {
      const item = x.data[0];
      item.driver.departement = departementWithOwnerSemanticForADS;
      item.driver.professional_licence = "sameProfessionalLicence";
      item.vehicle.licence_plate = "sameLicencePlate";
      item.ads.insee = inseeWithOwnerSemanticForADS;
      item.ads.numero = "sameNumero";
    });
    await initTaxiReferencesWithOwnerSemanticForADS(sameDto, operatorA);
    await initTaxiReferencesWithOwnerSemanticForADS(sameDto, operatorB);

    const responseWithOperatorA = await postTaxi(sameDto, operatorA);
    const responseWithOperatorB = await postTaxi(sameDto, operatorB);

    assert.strictEqual(responseWithOperatorA.status, StatusCodes.CREATED);
    assert.strictEqual(responseWithOperatorB.status, StatusCodes.CREATED);
  });

  it("Should be able to create duplicate taxi for same operator but different department", async () => {
    const sameInsee = inseeWithPermitSemanticForADS;
    const sameProfessionalLicence = getProfessionalLicence();
    const sameLicencePlate = generateCommercialLicencePlate();

    const firstDeptWithLicenseReuseDto = copyTaxiTemplate((x) => {
      x.data[0].driver.departement = departementWithPermitSemanticForADS;
      x.data[0].driver.professional_licence = sameProfessionalLicence;
      x.data[0].vehicle.licence_plate = sameLicencePlate;
      x.data[0].ads.insee = sameInsee;
    });
    const secondDeptWithLicenseReuseDto = copyTaxiTemplate((x) => {
      x.data[0].driver.departement = departementWithOwnerSemanticForADS;
      x.data[0].driver.professional_licence = sameProfessionalLicence;
      x.data[0].vehicle.licence_plate = sameLicencePlate;
      x.data[0].ads.insee = sameInsee;
    });
    await initTaxiReferencesWithPermitSemanticForADS(
      firstDeptWithLicenseReuseDto
    );
    await initTaxiReferencesWithPermitSemanticForADS(
      secondDeptWithLicenseReuseDto
    );

    const canUseLicenseFor1stTime = await postTaxi(
      firstDeptWithLicenseReuseDto
    );
    const canReuseLicenseFor2ndTime = await postTaxi(
      secondDeptWithLicenseReuseDto
    );

    assert.strictEqual(canUseLicenseFor1stTime.status, StatusCodes.CREATED);
    assert.strictEqual(canReuseLicenseFor2ndTime.status, StatusCodes.CREATED);
    assert.notStrictEqual(
      canUseLicenseFor1stTime.body.data[0].id,
      canReuseLicenseFor2ndTime.body.data[0].id
    );
  });

  it("Should be able to create duplicate taxi for same operator but different zones", async () => {
    const firstZone = inseeWithPermitSemanticForADS;
    const secondZone = inseeWithOwnerSemanticForADS;
    const sameDepartement = departementWithOwnerSemanticForADS;
    const sameProfessionalLicence = getProfessionalLicence();
    const sameNumberForPermitAndOwner = generateAutoNumeroAds();
    const sameLicencePlate = generateStandardLicencePlate();

    const firstZoneWithLicenseReuseDto = copyTaxiTemplate((x) => {
      x.data[0].driver.departement = sameDepartement;
      x.data[0].driver.professional_licence = sameProfessionalLicence;
      x.data[0].ads.numero = sameNumberForPermitAndOwner;
      x.data[0].vehicle.licence_plate = sameLicencePlate;
      x.data[0].ads.insee = firstZone;
    });
    const secondZoneWithLicenseReuseDto = copyTaxiTemplate((x) => {
      x.data[0].driver.departement = sameDepartement;
      x.data[0].driver.professional_licence = sameProfessionalLicence;
      x.data[0].ads.numero = sameNumberForPermitAndOwner;
      x.data[0].vehicle.licence_plate = sameLicencePlate;
      x.data[0].ads.insee = secondZone;
    });
    await initTaxiReferencesWithPermitSemanticForADS(
      firstZoneWithLicenseReuseDto
    );
    await initTaxiReferencesWithOwnerSemanticForADS(
      secondZoneWithLicenseReuseDto
    );

    const canUseForZone1 = await postTaxi(firstZoneWithLicenseReuseDto);
    const canReuseForZone2 = await postTaxi(secondZoneWithLicenseReuseDto);

    assert.strictEqual(canUseForZone1.status, StatusCodes.CREATED);
    assert.strictEqual(canReuseForZone2.status, StatusCodes.CREATED);
    assert.notStrictEqual(
      canUseForZone1.body.data[0].id,
      canReuseForZone2.body.data[0].id
    );
  });

  it("Should allow many vehicule with same owner", async () => {
    const zoneHavingAOwnerSemanticForADS = inseeWithOwnerSemanticForADS;
    const sameDepartement = departementWithOwnerSemanticForADS;
    const sameProfessionalLicence = getProfessionalLicence();
    const sameOwner = generateAutoNumeroAds();
    const firstLicencePlate = generateStandardLicencePlate();
    const secondLicencePlate = generateStandardLicencePlate();

    const firstTaxiOfSameOwner = copyTaxiTemplate((x) => {
      x.data[0].driver.departement = sameDepartement;
      x.data[0].driver.professional_licence = sameProfessionalLicence;
      x.data[0].ads.numero = sameOwner;
      x.data[0].vehicle.licence_plate = firstLicencePlate;
      x.data[0].ads.insee = zoneHavingAOwnerSemanticForADS;
    });
    const secondTaxiOfSameOwner = copyTaxiTemplate((x) => {
      x.data[0].driver.departement = sameDepartement;
      x.data[0].driver.professional_licence = sameProfessionalLicence;
      x.data[0].ads.numero = sameOwner;
      x.data[0].vehicle.licence_plate = secondLicencePlate;
      x.data[0].ads.insee = zoneHavingAOwnerSemanticForADS;
    });
    await initTaxiReferencesWithOwnerSemanticForADS(firstTaxiOfSameOwner);
    await initTaxiReferencesWithOwnerSemanticForADS(secondTaxiOfSameOwner);

    const canUse = await postTaxi(firstTaxiOfSameOwner);
    const canReuse = await postTaxi(secondTaxiOfSameOwner);

    assert.strictEqual(canUse.status, StatusCodes.CREATED);
    assert.strictEqual(canReuse.status, StatusCodes.CREATED);
    assert.notStrictEqual(canUse.body.data[0].id, canReuse.body.data[0].id);
  });

  it('Should NOT allow to create duplicate taxi for same ADS having a "permit" semantic', async () => {
    const sameDepartement = departementWithOwnerSemanticForADS;
    const sameProfessionalLicence = getProfessionalLicence();
    const samePermitNumber = generateAutoNumeroAds();
    const sameLicencePlate = generateLegacyLicencePlate();

    const firstTaxiOfSameOwner = copyTaxiTemplate((x) => {
      x.data[0].driver.departement = sameDepartement;
      x.data[0].driver.professional_licence = sameProfessionalLicence;
      x.data[0].ads.numero = samePermitNumber;
      x.data[0].vehicle.licence_plate = sameLicencePlate;
      x.data[0].ads.insee = inseeWithPermitSemanticForADS;
    });
    const secondTaxiOfSameOwner = copyTaxiTemplate((x) => {
      x.data[0].driver.departement = sameDepartement;
      x.data[0].driver.professional_licence = sameProfessionalLicence;
      x.data[0].ads.numero = samePermitNumber;
      x.data[0].vehicle.licence_plate = sameLicencePlate;
      x.data[0].ads.insee = inseeWithPermitSemanticForADS;
    });
    await initTaxiReferencesWithPermitSemanticForADS(firstTaxiOfSameOwner);
    await initTaxiReferencesWithPermitSemanticForADS(secondTaxiOfSameOwner);

    const canUse = await postTaxi(firstTaxiOfSameOwner);
    const canReuse = await postTaxi(secondTaxiOfSameOwner);

    assert.strictEqual(canUse.status, StatusCodes.CREATED);
    assert.strictEqual(canReuse.status, StatusCodes.OK);
    assert.strictEqual(canUse.body.data[0].id, canReuse.body.data[0].id);
  });

  it('Should allow to mix drivers with ADS having "permit" semantic', async () => {
    const attempt = copyTaxiTemplate((x) => {
      x.data[0].driver.departement = departementWithOwnerSemanticForADS;
      x.data[0].driver.professional_licence = getProfessionalLicence();
      x.data[0].ads.numero = generateAutoNumeroAds();
      x.data[0].ads.insee = inseeWithPermitSemanticForADS;
    });
    await initTaxiReferencesWithPermitSemanticForADS(attempt);

    const canUse = await postTaxi(attempt);

    assert.strictEqual(canUse.status, StatusCodes.CREATED);
  });

  it('Should allow to mix licence plate with ADS having "permit" semantic', async () => {
    const attempt = copyTaxiTemplate((x) => {
      x.data[0].driver.departement = departementWithOwnerSemanticForADS;
      x.data[0].driver.professional_licence = getProfessionalLicence();
      x.data[0].ads.numero = generateAutoNumeroAds();
      x.data[0].ads.insee = inseeWithPermitSemanticForADS;
      x.data[0].vehicle.licence_plate = generateCommercialLicencePlate();
    });
    await initTaxiReferencesWithPermitSemanticForADS(attempt);

    const canUse = await postTaxi(attempt);

    assert.strictEqual(canUse.status, StatusCodes.CREATED);
  });

  it("Should succeed when receiving a vehicle with a `constructor` property", async () => {
    const dtoCreate = copyTaxiTemplate();
    const vehicle = {
      ...dtoCreate.data[0].vehicle,
      constructor: "defaultConstructor",
    };
    dtoCreate.data[0].vehicle = vehicle;

    const response = await setupNewTaxi(dtoCreate);
    assert.strictEqual(response.status, StatusCodes.CREATED);
  });
}

function testCreateTaxiUserAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to create a taxi `, async () => {
    const dtoCreate = copyTaxiTemplate();
    const apiKey = await getImmutableUserApiKey(role);

    const response = await setupNewTaxi(dtoCreate, apiKey);
    assert.strictEqual(response.status, StatusCodes.CREATED);
  });
}

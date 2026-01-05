// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { shouldThrow } from "@villedemontreal/concurrent-api-tests";
import { assert } from "chai";
import { StatusCodes } from "http-status-codes";
import { generateAutoNumeroAds } from "../ads/ads.apiClient";
import {
  departementWithOwnerSemanticForADS,
  departementWithPermitSemanticForADS,
  inseeWithOwnerSemanticForADS,
} from "../ads/adsDto.template";
import { getProfessionalLicence } from "../drivers/driver.apiClient";
import { UserRole } from "../shared/commonTests/UserRole";
import { getImmutableUserApiKey } from "../users/user.sharedFixture";
import { generateCommercialLicencePlate } from "../vehicles/vehicle.apiClient";
import { getTaxiById, postTaxi } from "./taxi.apiClient";
import {
  initTaxiReferencesWithOwnerSemanticForADS,
  setupNewTaxi,
} from "./taxi.fixture";
import { copyTaxiTemplate } from "./taxisDto.template";

// eslint-disable-next-line max-lines-per-function
export async function invalidTaxiTests(): Promise<void> {
  testCreateTaxiUserAccessInvalid(UserRole.Motor);
  testCreateTaxiUserAccessInvalid(UserRole.Inspector);
  testCreateTaxiUserAccessInvalid(UserRole.Manager);
  testCreateTaxiUserAccessInvalid(UserRole.Stats);
  testCreateTaxiUserAccessInvalid(UserRole.Prefecture);

  it("Should be an error 400 Empty Array", async () => {
    await shouldThrow(
      () => postTaxi({ data: [] } as any),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(
          err.response.body.error.message,
          "The array should not be empty"
        );
      }
    );
  });

  it("Should return error when data length is more than one", async () => {
    const dtoCreate = copyTaxiTemplate();

    const dto2 = copyTaxiTemplate((x) => {
      x.data[0].ads.insee = "Second Array";
    });
    dtoCreate.data.push(dto2.data[0]);

    await shouldThrow(
      () => setupNewTaxi(dtoCreate),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(
          err.response.body.error.message,
          "The array reached its limit of 1 items"
        );
      }
    );
  });

  it("Should return error with ads.insee not found", async () => {
    const apiKey = await getImmutableUserApiKey(UserRole.Operator);
    const dtoCreate = copyTaxiTemplate();
    const response = await setupNewTaxi(dtoCreate, apiKey);
    assert.strictEqual(response.status, StatusCodes.CREATED);

    const responseItem = response.body.data[0];
    const dtoUpdate = copyTaxiTemplate((x) => {
      const item = x.data[0];
      item.ads.insee = "_notFoundInsee_";
      item.ads.numero = responseItem.ads.numero;
      item.driver.departement = responseItem.driver.departement;
      item.driver.professional_licence =
        responseItem.driver.professional_licence;
      item.vehicle.licence_plate = responseItem.vehicle.licence_plate;
    });
    await shouldThrow(
      () => postTaxi(dtoUpdate, apiKey),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          "Unable to find a permit with insee"
        );
      }
    );
  });

  it("Should return error with ads.numero not found", async () => {
    const apiKey = await getImmutableUserApiKey(UserRole.Operator);
    const dtoCreate = copyTaxiTemplate();
    const response = await setupNewTaxi(dtoCreate, apiKey);
    assert.strictEqual(response.status, StatusCodes.CREATED);

    const responseItem = response.body.data[0];
    const dtoUpdate = copyTaxiTemplate((x) => {
      const item = x.data[0];
      item.ads.insee = responseItem.ads.insee;
      item.ads.numero = "_notFoundNumero_";
      item.driver.departement = responseItem.driver.departement;
      item.driver.professional_licence =
        responseItem.driver.professional_licence;
      item.vehicle.licence_plate = responseItem.vehicle.licence_plate;
    });
    await shouldThrow(
      () => postTaxi(dtoUpdate, apiKey),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          "Unable to find a permit with insee"
        );
      }
    );
  });

  it("Should return error with vehicle.licence_plate not found", async () => {
    const apiKey = await getImmutableUserApiKey(UserRole.Operator);
    const dtoCreate = copyTaxiTemplate();
    const response = await setupNewTaxi(dtoCreate, apiKey);
    assert.strictEqual(response.status, StatusCodes.CREATED);

    const responseItem = response.body.data[0];
    const dtoUpdate = copyTaxiTemplate((x) => {
      const item = x.data[0];
      item.ads.insee = responseItem.ads.insee;
      item.ads.numero = responseItem.ads.numero;
      item.driver.departement = responseItem.driver.departement;
      item.driver.professional_licence =
        responseItem.driver.professional_licence;
      item.vehicle.licence_plate = "_notFoundLicencePlate_";
    });
    await shouldThrow(
      () => postTaxi(dtoUpdate, apiKey),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          "Unable to find a vehicle with licence plate"
        );
      }
    );
  });

  it("Should return error with driver.departement not found", async () => {
    const apiKey = await getImmutableUserApiKey(UserRole.Operator);
    const dtoCreate = copyTaxiTemplate();
    const response = await setupNewTaxi(dtoCreate, apiKey);
    assert.strictEqual(response.status, StatusCodes.CREATED);

    const responseItem = response.body.data[0];
    const dtoUpdate = copyTaxiTemplate((x) => {
      const item = x.data[0];
      item.ads.insee = responseItem.ads.insee;
      item.ads.numero = responseItem.ads.numero;
      item.driver.departement = "00000000";
      item.driver.professional_licence =
        responseItem.driver.professional_licence;
      item.vehicle.licence_plate = responseItem.vehicle.licence_plate;
    });
    await shouldThrow(
      () => postTaxi(dtoUpdate, apiKey),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          "Unable to find a driver with department"
        );
      }
    );
  });

  it("GET. Should return error with aperator disallowed", async () => {
    const apiKeyValidUser = await getImmutableUserApiKey(UserRole.Operator);
    const dtoCreate = copyTaxiTemplate();
    const response = await setupNewTaxi(dtoCreate, apiKeyValidUser);
    assert.strictEqual(response.status, StatusCodes.CREATED);

    const apiKeyDifferentUser = await getImmutableUserApiKey(UserRole.Admin);
    const taxiId = response.body.data[0].id;

    await shouldThrow(
      () => getTaxiById(taxiId, apiKeyDifferentUser),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          "Unable to find a taxi with id"
        );
        assert.include(err.response.body.error.message, "that was created by");
      }
    );
  });

  it("Should NOT allow to mix legacy drivers with ADS", async () => {
    const apiKeyValidUser = await getImmutableUserApiKey(UserRole.Operator);
    const dtoCreate = copyTaxiTemplate((x) => {
      x.data[0].driver.departement = departementWithPermitSemanticForADS;
      x.data[0].driver.professional_licence = getProfessionalLicence();
      x.data[0].vehicle.licence_plate = generateCommercialLicencePlate();
      x.data[0].ads.insee = inseeWithOwnerSemanticForADS;
      x.data[0].ads.numero = generateAutoNumeroAds();
    });
    await initTaxiReferencesWithOwnerSemanticForADS(dtoCreate, apiKeyValidUser);

    await shouldThrow(
      () => postTaxi(dtoCreate, apiKeyValidUser),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, "bill 17");
      }
    );
  });

  it("Should NOT allow to mix legacy licence plate with ADS", async () => {
    const apiKeyValidUser = await getImmutableUserApiKey(UserRole.Operator);

    const legacyLicencePlate1 = "T1234";
    const attempt1ToMixLegacyLicencePlateForNewTaxi = copyTaxiTemplate((x) => {
      x.data[0].driver.departement = departementWithOwnerSemanticForADS;
      x.data[0].driver.professional_licence = getProfessionalLicence();
      x.data[0].vehicle.licence_plate = legacyLicencePlate1;
      x.data[0].ads.insee = inseeWithOwnerSemanticForADS;
      x.data[0].ads.numero = generateAutoNumeroAds();
    });
    await initTaxiReferencesWithOwnerSemanticForADS(
      attempt1ToMixLegacyLicencePlateForNewTaxi,
      apiKeyValidUser
    );
    await shouldThrow(
      () =>
        postTaxi(attempt1ToMixLegacyLicencePlateForNewTaxi, apiKeyValidUser),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, "bill 17");
      }
    );

    const legacyLicencePlate2 = "t987654321";
    const attempt2ToMixLegacyLicencePlateForNewTaxi = copyTaxiTemplate((x) => {
      x.data[0].driver.departement = departementWithOwnerSemanticForADS;
      x.data[0].driver.professional_licence = getProfessionalLicence();
      x.data[0].vehicle.licence_plate = legacyLicencePlate2;
      x.data[0].ads.insee = inseeWithOwnerSemanticForADS;
      x.data[0].ads.numero = generateAutoNumeroAds();
    });
    await initTaxiReferencesWithOwnerSemanticForADS(
      attempt2ToMixLegacyLicencePlateForNewTaxi,
      apiKeyValidUser
    );
    await shouldThrow(
      () =>
        postTaxi(attempt2ToMixLegacyLicencePlateForNewTaxi, apiKeyValidUser),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, "bill 17");
      }
    );
  });
}

function testCreateTaxiUserAccessInvalid(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to create a taxi `, async () => {
    const dtoCreate = copyTaxiTemplate();
    const apiKey = await getImmutableUserApiKey(role);

    await shouldThrow(
      () => setupNewTaxi(dtoCreate, apiKey),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.strictEqual(
          err.response.body.error.message,
          "The user has a role which has insufficient permissions to access this resource."
        );
      }
    );
  });
}

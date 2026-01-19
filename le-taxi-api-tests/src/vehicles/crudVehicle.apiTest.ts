// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from "chai";
import { StatusCodes } from "http-status-codes";

import { UserRole } from "../shared/commonTests/UserRole";
import { IVehicle } from "../shared/taxiRegistryDtos/taxiRegistryDtos";
import {
  createNonImmutableUser,
  getImmutableUserApiKey,
} from "../users/user.sharedFixture";
import { postVehicle } from "./vehicle.apiClient";
import { copyVehicleTemplate } from "./vehiclesDto.template";

export async function crudVehicleTests(): Promise<void> {
  testCreateVehicleUserAccessValid(UserRole.Admin);
  testCreateVehicleUserAccessValid(UserRole.Operator);

  it("Can create a vehicle directly from template", async () => {
    const dtoCreate = copyVehicleTemplate();
    const response = await postVehicle(dtoCreate);
    assert.strictEqual(response.status, StatusCodes.CREATED);
  });

  it("Create a vehicle when optional attributes are empty", async () => {
    const dtoCreate = copyVehicleTemplate();

    dtoCreate.data[0].color = "";
    dtoCreate.data[0].engine = "";
    dtoCreate.data[0].horodateur = "";
    dtoCreate.data[0].taximetre = "";

    const response = await postVehicle(dtoCreate);

    assert.strictEqual(response.status, StatusCodes.CREATED);
  });

  it("Create a vehicle when optional attributes are null", async () => {
    const dtoCreate = copyVehicleTemplate();

    dtoCreate.data[0].air_con = null;
    dtoCreate.data[0].amex_accepted = null;
    dtoCreate.data[0].baby_seat = null;
    dtoCreate.data[0].bank_check_accepted = null;
    dtoCreate.data[0].bike_accepted = null;
    dtoCreate.data[0].bonjour = null;
    dtoCreate.data[0].color = null;
    dtoCreate.data[0].cpam_conventionne = null;
    dtoCreate.data[0].credit_card_accepted = null;
    dtoCreate.data[0].date_dernier_ct = null;
    dtoCreate.data[0].date_validite_ct = null;
    dtoCreate.data[0].dvd_player = null;
    dtoCreate.data[0].electronic_toll = null;
    dtoCreate.data[0].engine = null;
    dtoCreate.data[0].every_destination = null;
    dtoCreate.data[0].fresh_drink = null;
    dtoCreate.data[0].gps = null;
    dtoCreate.data[0].horodateur = null;
    dtoCreate.data[0].horse_power = null;
    dtoCreate.data[0].id = null;
    dtoCreate.data[0].luxury = null;
    dtoCreate.data[0].model_year = null;
    dtoCreate.data[0].nb_seats = null;
    dtoCreate.data[0].nfc_cc_accepted = null;
    dtoCreate.data[0].pet_accepted = null;
    dtoCreate.data[0].relais = null;
    dtoCreate.data[0].special_need_vehicle = null;
    dtoCreate.data[0].tablet = null;
    dtoCreate.data[0].taximetre = null;
    dtoCreate.data[0].type_ = null;
    dtoCreate.data[0].wifi = null;
    dtoCreate.data[0].vehicle_identification_number = null;

    const response = await postVehicle(dtoCreate);

    assert.strictEqual(response.status, StatusCodes.CREATED);
  });

  it("Create a vehicle when optional attributes are missing", async () => {
    const dtoCreate = copyVehicleTemplate();

    delete dtoCreate.data[0].air_con;
    delete dtoCreate.data[0].amex_accepted;
    delete dtoCreate.data[0].baby_seat;
    delete dtoCreate.data[0].bank_check_accepted;
    delete dtoCreate.data[0].bike_accepted;
    delete dtoCreate.data[0].bonjour;
    delete dtoCreate.data[0].color;
    delete dtoCreate.data[0].cpam_conventionne;
    delete dtoCreate.data[0].credit_card_accepted;
    delete dtoCreate.data[0].date_dernier_ct;
    delete dtoCreate.data[0].date_validite_ct;
    delete dtoCreate.data[0].dvd_player;
    delete dtoCreate.data[0].electronic_toll;
    delete dtoCreate.data[0].engine;
    delete dtoCreate.data[0].every_destination;
    delete dtoCreate.data[0].fresh_drink;
    delete dtoCreate.data[0].gps;
    delete dtoCreate.data[0].horodateur;
    delete dtoCreate.data[0].horse_power;
    delete dtoCreate.data[0].id;
    delete dtoCreate.data[0].luxury;
    delete dtoCreate.data[0].model_year;
    delete dtoCreate.data[0].nb_seats;
    delete dtoCreate.data[0].nfc_cc_accepted;
    delete dtoCreate.data[0].pet_accepted;
    delete dtoCreate.data[0].relais;
    delete dtoCreate.data[0].special_need_vehicle;
    delete dtoCreate.data[0].tablet;
    delete dtoCreate.data[0].taximetre;
    delete dtoCreate.data[0].type_;
    delete dtoCreate.data[0].wifi;
    delete dtoCreate.data[0].vehicle_identification_number;

    const response = await postVehicle(dtoCreate);

    assert.strictEqual(response.status, StatusCodes.CREATED);
  });

  it("Can initialize each vehicle attribute", async () => {
    const dtoCreate = copyVehicleTemplate((x) => {
      const item = x.data[0];
      item.date_dernier_ct = "2016-10-21";
      item.date_validite_ct = "2019-12-22";
      item.horse_power = 5.0;
      item.model_year = 2020;
      item.type_ = "sedan";
      item.nb_seats = 2;
      setAllFlags(x, true);
      item.horodateur = "horodateur-updated";
      item.color = "color-updated";
      item.taximetre = "taximetre-updated";
      item.engine = "engine-updated";
      item.constructor = "constructor-updated";
      item.model = "model-updated";
      item.vehicle_identification_number = "niv-updated";
    });

    const response = await postVehicle(dtoCreate);

    assert.strictEqual(response.status, StatusCodes.CREATED);
    const responseItem = response.body.data[0];
    assert.strictEqual(
      responseItem.date_dernier_ct.substring(0, 10),
      "2016-10-21",
    );
    assert.strictEqual(
      responseItem.date_validite_ct.substring(0, 10),
      "2019-12-22",
    );
    assert.strictEqual(responseItem.horse_power, 5.0);
    assert.strictEqual(responseItem.model_year, 2020);
    assert.strictEqual(responseItem.type_, "sedan");
    assert.strictEqual(responseItem.nb_seats, 2);
    checkAllFlags(response.body, true);
    assert.strictEqual(responseItem.horodateur, "horodateur-updated");
    assert.strictEqual(responseItem.color, "color-updated");
    assert.strictEqual(responseItem.taximetre, "taximetre-updated");
    assert.strictEqual(responseItem.engine, "engine-updated");
    assert.strictEqual(responseItem.constructor, "constructor-updated");
    assert.strictEqual(responseItem.model, "model-updated");
    assert.strictEqual(
      responseItem.vehicle_identification_number,
      "niv-updated",
    );
  });

  it("Can update each vehicle attribute", async () => {
    const dtoCreate = copyVehicleTemplate((x) => {
      const item = x.data[0];
      item.date_dernier_ct = "2016-10-21";
      item.date_validite_ct = "2019-12-22";
      item.horse_power = 5.0;
      item.model_year = 2020;
      item.type_ = "sedan";
      item.nb_seats = 2;
      setAllFlags(x, false);
    });
    const responseCreate = await postVehicle(dtoCreate);
    const dtoUpdate = copyVehicleTemplate((x) => {
      const item = x.data[0];
      item.licence_plate = responseCreate.body.data[0].licence_plate;
      item.date_dernier_ct = "2017-10-21";
      item.date_validite_ct = "2020-12-22";
      item.horse_power = 10.1;
      item.model_year = 2019;
      item.type_ = "mpv";
      item.nb_seats = 3;
      setAllFlags(x, true);
      item.horodateur = "horodateur-updated";
      item.color = "color-updated";
      item.taximetre = "taximetre-updated";
      item.engine = "engine-updated";
      item.constructor = "constructor-updated";
      item.model = "model-updated";
      item.vehicle_identification_number = "niv-updated";
    });

    const responseUpdate = await postVehicle(dtoUpdate);

    assert.strictEqual(responseUpdate.status, StatusCodes.OK);
    const responseUpdateItem = responseUpdate.body.data[0];
    assert.strictEqual(
      responseUpdateItem.licence_plate,
      responseCreate.body.data[0].licence_plate,
    );
    assert.strictEqual(
      responseUpdateItem.date_dernier_ct.substring(0, 10),
      "2017-10-21",
    );
    assert.strictEqual(
      responseUpdateItem.date_validite_ct.substring(0, 10),
      "2020-12-22",
    );
    assert.strictEqual(responseUpdateItem.horse_power, 10.1);
    assert.strictEqual(responseUpdateItem.model_year, 2019);
    assert.strictEqual(responseUpdateItem.type_, "mpv");
    assert.strictEqual(responseUpdateItem.nb_seats, 3);
    checkAllFlags(responseUpdate.body, true);
    assert.strictEqual(responseUpdateItem.horodateur, "horodateur-updated");
    assert.strictEqual(responseUpdateItem.color, "color-updated");
    assert.strictEqual(responseUpdateItem.taximetre, "taximetre-updated");
    assert.strictEqual(responseUpdateItem.engine, "engine-updated");
    assert.strictEqual(responseUpdateItem.constructor, "constructor-updated");
    assert.strictEqual(responseUpdateItem.model, "model-updated");
    assert.strictEqual(
      responseUpdateItem.vehicle_identification_number,
      "niv-updated",
    );
  });

  it("Cannot alter the vehicle of another operator", async () => {
    const operatorA = await getImmutableUserApiKey(UserRole.Operator);
    const operatorB = (await createNonImmutableUser(UserRole.Operator)).apikey;
    const sameDto = copyVehicleTemplate(
      (x) => (x.data[0].licence_plate = "same"),
    );

    const canCreateMine = await postVehicle(sameDto, operatorA);
    const canUpdateMine = await postVehicle(sameDto, operatorA);
    const cannotUpdateYours = await postVehicle(sameDto, operatorB);

    // Cannot automate the assert for updating with operator B,
    // but still perform the test case.
    // in doubt it can be check manually in postgre.
    await postVehicle(sameDto, operatorB);

    assert.strictEqual(canCreateMine.status, StatusCodes.CREATED);
    assert.strictEqual(canUpdateMine.status, StatusCodes.OK);
    // The api makes it difficult to assert that there are no side effects,
    // because there are no GET on vehicle. At least, we check that sending
    // the same dto with another operator perform a create instead of an update
    assert.strictEqual(cannotUpdateYours.status, StatusCodes.CREATED);
  });

  it("Vehicle licence plage is case sensitive", async () => {
    const lower = copyVehicleTemplate((x) => {
      x.data[0].licence_plate = "case";
    });
    const upper = copyVehicleTemplate((x) => {
      x.data[0].licence_plate = "CASE";
    });

    const lowerResponse = await postVehicle(lower);
    const upperResponse = await postVehicle(upper);

    assert.strictEqual(lowerResponse.status, StatusCodes.CREATED);
    // if licence_plate was not case sensitive upper status would be 200
    // because it will update lower
    assert.strictEqual(upperResponse.status, StatusCodes.CREATED);
  });
}

export function setAllFlags(dto: IVehicle, value: boolean) {
  const item = dto.data[0];
  item.air_con = value;
  item.bonjour = value;
  item.credit_card_accepted = value;
  item.electronic_toll = value;
  item.fresh_drink = value;
  item.pet_accepted = value;
  item.tablet = value;
  item.dvd_player = value;
  item.every_destination = value;
  item.nfc_cc_accepted = value;
  item.baby_seat = value;
  item.special_need_vehicle = value;
  item.amex_accepted = value;
  item.gps = value;
  item.cpam_conventionne = value;
  item.relais = value;
  item.bank_check_accepted = value;
  item.luxury = value;
  item.wifi = value;
  item.bike_accepted = value;
}

function checkAllFlags(dto: IVehicle, value: boolean) {
  const item = dto.data[0];
  assert.strictEqual(item.air_con, value);
  assert.strictEqual(item.bonjour, value);
  assert.strictEqual(item.credit_card_accepted, value);
  assert.strictEqual(item.electronic_toll, value);
  assert.strictEqual(item.fresh_drink, value);
  assert.strictEqual(item.pet_accepted, value);
  assert.strictEqual(item.tablet, value);
  assert.strictEqual(item.dvd_player, value);
  assert.strictEqual(item.every_destination, value);
  assert.strictEqual(item.nfc_cc_accepted, value);
  assert.strictEqual(item.baby_seat, value);
  assert.strictEqual(item.special_need_vehicle, value);
  assert.strictEqual(item.amex_accepted, value);
  assert.strictEqual(item.gps, value);
  assert.strictEqual(item.cpam_conventionne, value);
  assert.strictEqual(item.relais, value);
  assert.strictEqual(item.bank_check_accepted, value);
  assert.strictEqual(item.luxury, value);
  assert.strictEqual(item.wifi, value);
  assert.strictEqual(item.bike_accepted, value);
}

function testCreateVehicleUserAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to create a vehicle `, async () => {
    const dtoCreate = copyVehicleTemplate();
    const apiKey = await getImmutableUserApiKey(role);

    const response = await postVehicle(dtoCreate, apiKey);
    assert.strictEqual(response.status, StatusCodes.CREATED);
  });
}

// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { getCurrentUnixTime } from "../shared/commonTests/testUtil";
import { UserRole } from "../shared/commonTests/UserRole";
import {
  ITaxiPositionSnapShotItem,
  ITaxiPositionSnapShots,
} from "../shared/taxiRegistryDtos/taxiRegistryDtos";
import { setupNewTaxi } from "../taxis/taxi.fixture";
import { copyTaxiTemplate } from "../taxis/taxisDto.template";
import { createUser } from "../users/user.apiClient";
import { copyUserTemplate } from "../users/userDto.template";
import { postTaxiPositionSnapshots } from "./taxiPositionSnapshots.apiClient";
import {
  copyTaxiPositionSnapShotItemTemplate,
  copyTaxiPositionTemplate,
} from "./taxiPositionSnapShotsDto.template";

export async function getValidTaxiPositionSnapshotDtoAndApikey(
  role: UserRole,
  itemCount = 1,
): Promise<[ITaxiPositionSnapShots, string]> {
  const userDto = copyUserTemplate((x) => {
    x.role = role;
  });
  const user = await createUser(userDto);
  const apiKey = user.apikey;
  const operatorEmail = user.email;

  const dtoCreateTaxi = copyTaxiTemplate();
  const createdTaxi = await setupNewTaxi(dtoCreateTaxi, apiKey);
  const taxiId = createdTaxi.body.data[0].id;
  const timestamp = getCurrentUnixTime();

  const dtoTaxiPositionSnapShot = copyTaxiPositionTemplate((x) => {
    x.items[0].timestamp = timestamp;
    x.items[0].taxi = taxiId;
    x.items[0].operator = operatorEmail;
  });

  [...Array(itemCount - 1)].forEach(() =>
    dtoTaxiPositionSnapShot.items.push(
      copyTaxiPositionSnapShotItemTemplate((x) => {
        x.timestamp = timestamp;
        x.taxi = taxiId;
        x.operator = operatorEmail;
      }),
    ),
  );

  return [dtoTaxiPositionSnapShot, apiKey];
}

export async function createTaxiWithStatus(status: string, apiKey: string) {
  const dtoCreate = copyTaxiTemplate();
  const response = await setupNewTaxi(dtoCreate, apiKey);

  const dtoUpdateTaxiPosition = copyTaxiPositionTemplate((x) => {
    x.items[0].status = status;
    x.items[0].taxi = response.body.data[0].id;
    x.items[0].operator = response.body.data[0].operator;
    x.items[0].timestamp = getCurrentUnixTime();
  });
  await postTaxiPositionSnapshots(dtoUpdateTaxiPosition, apiKey);
  return response;
}

export async function setTaxiPosition(
  snapshot: Partial<ITaxiPositionSnapShotItem>,
  apiKey?: string,
) {
  const dtoUpdateTaxiPosition = copyTaxiPositionTemplate((x) => {
    x.items[0].taxi = snapshot.taxi;
    x.items[0].operator = snapshot.operator;
    x.items[0].lat = snapshot.lat;
    x.items[0].lon = snapshot.lon;
    x.items[0].status = snapshot.status;
    x.items[0].timestamp = getCurrentUnixTime();
  });

  await postTaxiPositionSnapshots(dtoUpdateTaxiPosition, apiKey);
}

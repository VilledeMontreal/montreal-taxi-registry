// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as fs from "fs";
import { IUser } from "../../shared/taxiRegistryDtos/taxiRegistryDtos";
import { setupNewCustomTaxi } from "../../taxis/taxi.fixture";
import { createOperatorWithPromotion } from "../../users/user.sharedFixture";
import { ITaxiToLoad } from "./iTaxiToLoad";
import lodash = require("lodash");

// eslint-disable no-console
async function generateTaxisSharedState() {
  console.log("Generating the shared state may take around 20 minutes..");
  try {
    const taxis = await createTaxisToLoad();
    fs.writeFileSync(
      "src/taxiPositionSnapShots/loadTests/taxi.sharedState.json",
      JSON.stringify(taxis)
    );
  } catch (ex) {
    console.log(ex);
  }
}

async function createTaxisToLoad(): Promise<ITaxiToLoad> {
  const users = await createUsersToLoadTests();

  const items = await Promise.all(
    users.map((user) => createTaxisForUser(user))
  );
  return {
    items,
  };
}

async function createTaxisForUser(user: IUser) {
  const taxiResponses: any[] = [];

  // 200 taxis, 5% of which are special-need and 0% minivan (desired)
  for (let i = 0; i < 190; i++)
    taxiResponses.push(await createRegularTaxi(user.apikey));
  for (let i = 0; i < 10; i++)
    taxiResponses.push(await createSpecialNeedTaxi(user.apikey));

  const taxiIds = taxiResponses.map((taxi) => ({
    id: taxi.body.data[0].id as string,
  }));

  return {
    operator: {
      apikey: user.apikey,
      email: user.email,
    },
    taxi: taxiIds,
  };
}

async function createUsersToLoadTests() {
  const promotions = { standard: true, minivan: true, special_need: true };
  return await Promise.all(
    lodash.times(100, async () => await createOperatorWithPromotion(promotions))
  );
}

async function createRegularTaxi(apikey: string) {
  return await setupNewCustomTaxi(false, "sedan", apikey);
}

async function createSpecialNeedTaxi(apikey: string) {
  return await setupNewCustomTaxi(true, "sedan", apikey);
}

generateTaxisSharedState();

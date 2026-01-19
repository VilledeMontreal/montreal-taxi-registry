// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as fs from "fs";
import { UserRole } from "../shared/commonTests/UserRole";
import { setupNewCustomTaxi } from "../taxis/taxi.fixture";
import { getImmutableUser } from "../users/user.sharedFixture";

async function generateTaxisSharedState() {
  try {
    const taxis = await createCustomisedTaxis();
    fs.writeFileSync(
      "src/apiIntegrationTests/apiIntegrationTests.sharedState.json",
      JSON.stringify(taxis),
    );

    console.log(
      `----------------------------------------------------------------------------------------
File src/apiIntegrationTests/apiIntegrationTests.sharedState.json has been created.
Copy above file to: le-taxi-api-node.js src/tests/integration-tests/
Or command line (assuming a git clone of le-taxi-api-tests and le-taxi-api-node.js done in current dir):
cp ../le-taxi-api-tests/src/apiIntegrationTests/apiIntegrationTests.sharedState.json ../le-taxi-api-node.js/src/tests/integration-tests/.
See: src/apiIntegrationTests/README.md for more information.
----------------------------------------------------------------------------------------`,
    );
  } catch (ex) {
    console.log(ex);
  }
}

async function createCustomisedTaxis() {
  const motorUser = await getImmutableUser(UserRole.Motor);
  const operatorUser = await getImmutableUser(UserRole.Operator);

  const customizingValues = [
    { specialNeedVehicle: false, type: "sedan" },
    { specialNeedVehicle: true, type: "sedan" },
    { specialNeedVehicle: true, type: "mpv" },
    { specialNeedVehicle: false, type: "mpv" },
    { specialNeedVehicle: false, type: "sedan" },
    { specialNeedVehicle: true, type: "sedan" },
    { specialNeedVehicle: true, type: "mpv" },
    { specialNeedVehicle: false, type: "mpv" },
    { specialNeedVehicle: false, type: "sedan" },
  ];
  const taxisId = Array(customizingValues.length);

  await Promise.all(
    customizingValues.map(async (element, index) => {
      const taxi = await setupNewCustomTaxi(
        element.specialNeedVehicle,
        element.type,
        operatorUser.apikey,
      );
      taxisId[index] = taxi.body.data[0].id;
    }),
  );

  return {
    customisedTaxis: taxisId,
    operator: {
      email: operatorUser.email,
      apiKey: operatorUser.apikey,
    },
    motor: {
      apiKey: motorUser.apikey,
    },
  };
}

generateTaxisSharedState();

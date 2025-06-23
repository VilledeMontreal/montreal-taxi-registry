// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as fs from "fs";
import { UserRole } from "../../shared/commonTests/UserRole";
import { getImmutableUserApiKey } from "../../users/user.sharedFixture";
import { IMotorSharedState } from "./IMotorSharedState";

async function generateMotorSharedState() {
  const motorApiKey = await getImmutableUserApiKey(UserRole.Motor);
  const sharedState: IMotorSharedState = {
    searchMotor: {
      apiKey: motorApiKey,
    },
  };

  fs.writeFileSync(
    "src/taxis/loadTests/motor.sharedState.json",
    JSON.stringify(sharedState)
  );
}

generateMotorSharedState();

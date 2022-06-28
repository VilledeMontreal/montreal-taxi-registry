// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as fs from 'fs';

import { UserRole } from '../../shared/commonTests/UserRole';
import { setupNewTaxi } from '../../taxis/taxi.fixture';
import { copyTaxiTemplate } from '../../taxis/taxisDto.template';
import { getImmutableUser } from '../../users/user.sharedFixture';
import { IHailToLoad } from './iHailToLoad';

async function generateHailsSharedState() {
  try {
    const taxis = await createHailsToLoad();
    fs.writeFileSync('src/hails/loadTests/hail.sharedState.json', JSON.stringify(taxis));
  } catch (ex) {
    // tslint:disable-next-line: no-console
    console.log(ex);
  }
}

async function createHailsToLoad(): Promise<IHailToLoad> {
  const operator = await getImmutableUser(UserRole.Operator);
  const motor = await getImmutableUser(UserRole.Motor);

  const taxiResponses: any[] = [];
  for (let i = 0; i < 600; i++) {
    taxiResponses.push(await setupNewTaxi(copyTaxiTemplate(), operator.apikey));
  }
  const taxiIds = taxiResponses.map(taxi => ({
    id: taxi.body.data[0].id as string
  }));

  return {
    operator: {
      apiKey: operator.apikey,
      email: operator.email
    },
    motor: {
      apiKey: motor.apikey
    },
    taxis: taxiIds
  };
}

// tslint:disable-next-line: no-floating-promises
generateHailsSharedState();

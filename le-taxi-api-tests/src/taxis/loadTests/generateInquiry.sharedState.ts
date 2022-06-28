// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as fs from 'fs';
import { UserRole } from '../../shared/commonTests/UserRole';
import { getImmutableUserApiKey } from '../../users/user.sharedFixture';
import { IInquirySharedState } from './IInquirySharedState';

async function generateInquirySharedState() {
  const motorApiKey = await getImmutableUserApiKey(UserRole.Motor);
  const sharedState: IInquirySharedState = {
    searchMotor: {
      apiKey: motorApiKey
    }
  };

  fs.writeFileSync('src/taxis/loadTests/inquiry.sharedState.json', JSON.stringify(sharedState));
}

// tslint:disable-next-line: no-floating-promises
generateInquirySharedState();

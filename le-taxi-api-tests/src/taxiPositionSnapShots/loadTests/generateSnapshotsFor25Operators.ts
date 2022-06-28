// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import {
  beforeRequestForInitialization,
  beforeRequestForTests,
  initializeSnapshotsAndOperatorsApiKeys
} from './generateSnapshotsCommon';

// We create double the amount of operators so we can test that the index expiracy
// that occurs after 2 minutes doesn't impact the results.
initializeSnapshotsAndOperatorsApiKeys(25 * 2);

module.exports = {
  beforeRequestForInitialization,
  beforeRequestForTests
};

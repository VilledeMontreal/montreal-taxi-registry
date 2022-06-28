// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { v4 as uuidv4 } from 'uuid';

let testRunId: string = null;

export function getTestLabel(testName: string, estimatedTestingTime: string) {
  return `${testName} ${getTestRunId()} (Testing time: +/-${estimatedTestingTime})`;
}

export function getTestRunId() {
  if (!testRunId) {
    testRunId = `zApiTest-${uuidv4()}`;
  }
  return testRunId;
}

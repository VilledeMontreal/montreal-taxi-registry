// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { getTestRunId } from "@villedemontreal/concurrent-api-tests";
import { commonTests } from "./commonTests.apiTest";
import { dataDumpsTests } from "./dataDumps.apiTest";
import { displaySuperagentStats } from "./shared/e2eTesting/superagentWithStats";

console.log(`All tests ${getTestRunId()} (Testing time: +/-2 minutes)`);

// Try to process longer tests first
dataDumpsTests();
commonTests();

afterAll(() => {
  displaySuperagentStats();
});

// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { commonTests } from "./commonTests.apiTest";
import { dataDumpsTests } from "./dataDumps.apiTest";
import { limitTestConcurrency } from "./shared/e2eTesting/limitTestConcurrency";
import { displaySuperagentStats } from "./shared/e2eTesting/superagentWithStats";
import { getTestLabel } from "./shared/e2eTesting/testRunId";

const parallel = require("mocha.parallel");

limitTestConcurrency();

parallel(getTestLabel("All tests", "2 minutes"), () => {
  // Try to process longer tests first
  dataDumpsTests();
  commonTests();
});

after(() => {
  displaySuperagentStats();
});

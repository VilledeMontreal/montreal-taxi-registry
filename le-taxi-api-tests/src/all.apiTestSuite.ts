// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
/* tslint:disable: no-floating-promises */
import { commonTests } from './commonTests.apiTest';
import { dataDumpsTests } from './dataDumps.apiTest';
import { motorIntegrationToolTests } from './hails/motorIntegrationTool.apiTest';
import { operatorIntegrationToolTests } from './hails/operatorIntegrationTool.apiTest';
import { limitTestConcurrency } from './shared/e2eTesting/limitTestConcurrency';
import { displaySuperagentStats } from './shared/e2eTesting/superagentWithStats';
import { getTestLabel } from './shared/e2eTesting/testRunId';

const parallel = require('mocha.parallel');

limitTestConcurrency();

parallel(getTestLabel('All tests', '2 minutes'), () => {
  // Try to process longer tests first
  operatorIntegrationToolTests();
  motorIntegrationToolTests();
  dataDumpsTests();
  commonTests();
});

after(() => {
  displaySuperagentStats();
});

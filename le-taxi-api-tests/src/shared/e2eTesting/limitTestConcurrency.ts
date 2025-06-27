// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { configs } from "../../../config/configs";

const parallel = require("mocha.parallel");

export function limitTestConcurrency() {
  parallel.limit(configs.e2eTesting.maxTestConcurrency);
}

// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { configs } from "../../../config/configs";

console.log(
  "WARNING: ALL LOAD TESTS MUST BE EXECUTED WITH A SINGLE REPLICA PER DEPLOYMENT!",
);

export function beforeFlow(context: any, ee: any, next: any) {
  context.vars.apikey = configs.apiTests.rootApiKey;
  return next();
}

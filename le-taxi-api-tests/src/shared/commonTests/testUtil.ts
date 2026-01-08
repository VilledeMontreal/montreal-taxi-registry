// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import assert = require("assert");

export const defaultDate = new Date("2000-01-01");

export function getCurrentUnixTime() {
  return parseInt(`${new Date().getTime() / 1000}`, 10);
}

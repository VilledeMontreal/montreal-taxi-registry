// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from "chai";
import {
  addSec,
  asUtcIsoString,
  isUtcIsoString,
  nowUtcIsoString,
  toUtcHumanDate,
  toUtcIsoString,
} from "./dateUtils";

describe("dateUtils", () => {
  it("asUtcIsoString returns assuming UTC", () => {
    const noTimezone = asUtcIsoString("2021-06-01 19:19:32");
    const utcTimeZone = asUtcIsoString("2021-06-01 19:19:32 +00:00");
    const localTimeZone = asUtcIsoString("2021-06-01 19:19:32 -04:00");

    assert.strictEqual(noTimezone, utcTimeZone);

    assert.strictEqual(noTimezone, "2021-06-01T19:19:32.000Z");
    assert.strictEqual(utcTimeZone, "2021-06-01T19:19:32.000Z");
    assert.strictEqual(localTimeZone, "2021-06-01T23:19:32.000Z");
  });

  it("toUtcIsoString returns assuming Local", () => {
    const noTimezone = toUtcIsoString("2021-06-01 19:19:32");
    const utcTimeZone = toUtcIsoString("2021-06-01 19:19:32 +00:00");
    const localTimeZone = toUtcIsoString("2021-06-01 19:19:32 -04:00");

    assert.strictEqual(noTimezone, localTimeZone);

    assert.strictEqual(noTimezone, "2021-06-01T23:19:32.000Z");
    assert.strictEqual(utcTimeZone, "2021-06-01T19:19:32.000Z");
    assert.strictEqual(localTimeZone, "2021-06-01T23:19:32.000Z");
  });

  it("addSec to IsoString", () => {
    const actual = addSec("2020-02-29T23:59:59.000Z", 5);
    assert.strictEqual(actual, "2020-03-01T00:00:04.000Z");
  });

  it("isUtcIsoString recognizes the format properly", () => {
    const actual = "2020-02-29T23:59:59.000Z";
    assert.isTrue(isUtcIsoString(actual));
  });

  it("isUtcIsoString dismisses non UtcIsoString format", () => {
    const noZ = "2020-02-29T23:59:59.000";
    const noT = "2020-02-29 23:59:59.000Z";
    const noMs = "2020-02-29T23:59:59Z";
    const noZnoT = "2020-02-29 23:59:59.000";
    const noZnoTnoMs = "2020-02-29 23:59:59";
    const extraTextFront = "xxx2020-02-29T23:59:59.000Z";
    const extraTextBack = "2020-02-29T23:59:59.000Zxxx";
    assert.isFalse(isUtcIsoString(noZ));
    assert.isFalse(isUtcIsoString(noT));
    assert.isFalse(isUtcIsoString(noMs));
    assert.isFalse(isUtcIsoString(noZnoT));
    assert.isFalse(isUtcIsoString(noZnoTnoMs));
    assert.isFalse(isUtcIsoString(extraTextFront));
    assert.isFalse(isUtcIsoString(extraTextBack));
  });

  it("nowUtcIsoString is UtcIsoString", () => {
    const actual = nowUtcIsoString();
    assert.isTrue(isUtcIsoString(actual));
  });

  it("toUtcHumanDate is returning a UTC date using the expected format", () => {
    const humanDate = toUtcHumanDate("2021-06-01 19:19:32 -04:00");
    assert.strictEqual(humanDate, "Tue, 01 Jun 2021 23:19:32 -0000");
  });
});

// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import assert = require("assert");

export const defaultDate = new Date("2000-01-01");

export function getCurrentUnixTime() {
  return parseInt(`${new Date().getTime() / 1000}`, 10);
}

export async function shouldThrow(
  act: () => Promise<any>,
  customAssert: (err: any) => void
) {
  let haveThrown = true;
  try {
    await act();
    haveThrown = false;
  } catch (err) {
    customAssert(err);
  }
  if (!haveThrown) {
    assert.fail(
      "It should have thrown an exception, but it succeeded unexpectedly."
    );
  }
}

export function aFewSeconds(delayInSeconds: number): Promise<void> {
  return aFewMilliseconds(delayInSeconds * 1000);
}

export function aFewMilliseconds(delayInMilliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
    setTimeout(async () => {
      resolve();
    }, delayInMilliseconds);
  });
}

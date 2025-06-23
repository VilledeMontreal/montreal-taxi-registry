// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import assert = require("assert");

export function getCurrentUnixTime() {
  return parseInt(`${new Date().getTime() / 1000}`, 10);
}

export async function shouldThrow(
  act: () => Promise<void>,
  customAssert: (err: any) => void
) {
  let haveTrown = true;
  try {
    await act();
    haveTrown = false;
  } catch (err) {
    customAssert(err);
  }
  if (!haveTrown) {
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
    setTimeout(() => {
      resolve();
    }, delayInMilliseconds);
  });
}

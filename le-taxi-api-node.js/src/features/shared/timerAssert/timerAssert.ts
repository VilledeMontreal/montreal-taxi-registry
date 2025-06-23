// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from "chai";

const now = require("performance-now");

export class TimerAssert {
  public static startNew() {
    const timer = new TimerAssert();
    timer.start();

    return timer;
  }

  private _startedAt: number = null;
  private _stoppedAt: number = null;

  public start() {
    this._startedAt = now();
  }

  public stop() {
    this._stoppedAt = now();
  }

  public assertDurationInMilisecondsIsBelow(expected: number) {
    assert.isBelow(
      this.durationMs,
      expected,
      "Duration (ms) is not below the expected value."
    );
  }

  public get durationMs(): number {
    if (!this._stoppedAt) {
      throw new Error("stop() must be invoked before asserting.");
    }
    if (!this._startedAt) {
      throw new Error("start() must be invoked before asserting.");
    }
    return this._stoppedAt - this._startedAt;
  }
}

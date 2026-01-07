// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import pino from "pino";

class Logger {
  public static readonly instance: Logger = new Logger();
  private logger: pino.Logger;

  private constructor() {
    const logStream: NodeJS.WriteStream = process.stdout;
    this.logger = pino(
      {
        name: "le-taxi-api-node.js",
        safe: true,
        timestamp: pino.stdTimeFunctions.isoTime,
        messageKey: "message",
        hooks: { logMethod },
      },
      logStream,
    );
  }

  public info(msg: string, obj?: object): void {
    if (obj) {
      this.logger.info(obj, msg);
    } else {
      this.logger.info(msg);
    }
  }

  public warning(msg: string, obj?: object): void {
    if (obj) {
      this.logger.warn(obj, msg);
    } else {
      this.logger.warn(msg);
    }
  }

  public error(msg: string, obj?: object): void {
    if (obj) {
      this.logger.error(obj, msg);
    } else {
      this.logger.error(msg);
    }
  }
}

function logMethod(args: any[], method: any) {
  if (args.length >= 2 && args[0].message) {
    args[0].originalMessage = args[0].message;
    delete args[0].message;
  }
  method.apply(this, args);
}

export const logger = Logger.instance;

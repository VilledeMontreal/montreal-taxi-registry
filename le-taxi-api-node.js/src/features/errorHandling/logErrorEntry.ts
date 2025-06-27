// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { configs } from "../../config/configs";
import { constants } from "../../config/constants";
import { IErrorLogEntry } from "../shared/expressErrorHandling/errorLogEntry";
import { logger } from "../shared/logging/logger";

export function logErrorLogEntry(errorLogEntry: IErrorLogEntry): void {
  if (
    !errorLogEntry.isServerFault &&
    configs.environment.type === constants.Environments.LOCAL
  ) {
    return; // Only log server fault in localhost, in order to view and fix server fault more easily.
  }

  logger.error(errorLogEntry.message, errorLogEntry);
}

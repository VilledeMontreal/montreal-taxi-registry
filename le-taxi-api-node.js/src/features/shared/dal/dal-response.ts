// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { DataOperation } from './dal-operations.enum';

export interface IDalResponse {
  entityId: number | string;
  dataOperation: DataOperation;
}

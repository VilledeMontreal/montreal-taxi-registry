// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { UserModel } from "./user.model";

function intializeSystemUser() {
  const model = new UserModel();
  model.role_name = "system";
  return Object.freeze(model);
}

export const systemUser = intializeSystemUser();

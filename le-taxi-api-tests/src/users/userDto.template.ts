// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { defineCopyTemplate } from "../shared/copyTemplate/copyTemplate";
import { IUser } from "../shared/taxiRegistryDtos/taxiRegistryDtos";

export const copyUserTemplate = defineCopyTemplate<IUser>({
  email: "auto",
  public_id: "auto",
  commercial_name: "defaultName",
  website_url: "http://website.com",
  role: 0,
});

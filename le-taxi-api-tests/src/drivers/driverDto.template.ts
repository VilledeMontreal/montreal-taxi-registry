// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { defineCopyTemplate } from "../shared/copyTemplate/copyTemplate";
import { IDriver } from "../shared/taxiRegistryDtos/taxiRegistryDtos";

export const copyDriverTemplate = defineCopyTemplate<IDriver>({
  data: [
    {
      birth_date: null, // sensitive data is ignored by the system
      departement: {
        nom: "Québec",
        numero: "1000",
      },
      first_name: "defaultFirstName",
      last_name: "defaultLastName",
      professional_licence: "auto",
    },
  ],
});

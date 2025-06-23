// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { defineCopyTemplate } from "../shared/copyTemplate/copyTemplate";
import {
  IPutTaxiRequest,
  ITaxi,
} from "../shared/taxiRegistryDtos/taxiRegistryDtos";

export const copyTaxiTemplate = defineCopyTemplate<ITaxi>({
  data: [
    {
      ads: {
        insee: "defaultInsee",
        numero: "defaultNumero",
      },
      driver: {
        departement: "defaultDepartement",
        professional_licence: "defaultProfessionalLicence",
      },
      vehicle: {
        licence_plate: "defaultLicencePlate",
      },
      status: "free",
      private: false,
    },
  ],
});

export const copyPutTaxiRequestTemplate = defineCopyTemplate<IPutTaxiRequest>({
  data: [
    {
      status: "free",
      private: false,
    },
  ],
});

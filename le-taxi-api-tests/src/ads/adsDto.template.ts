// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import {
  defineCopyTemplate,
  defineCopyTemplateVariation,
} from "@villedemontreal/concurrent-api-tests";
import { IAds } from "../shared/taxiRegistryDtos/taxiRegistryDtos";

export const inseeWithPermitSemanticForADS = "102005";
export const inseeWithOwnerSemanticForADS = "1000";

export const departementWithPermitSemanticForADS = "660";
export const departementWithOwnerSemanticForADS = "1000";

export const copyAdsOwnerTemplate = defineCopyTemplate<IAds>({
  data: [
    {
      category: "",
      vehicle_id: null, // optional, and useless
      insee: inseeWithOwnerSemanticForADS,
      numero: "auto",
      owner_name: "defaultOwnerName",
      owner_type: "company",
      doublage: false,
    },
  ],
});

export const copyAdsPermitTemplate = defineCopyTemplateVariation(
  copyAdsOwnerTemplate,
  (items) => {
    const item = items.data[0];
    item.insee = inseeWithPermitSemanticForADS;
    item.vdm_vignette = "9999";
  }
);

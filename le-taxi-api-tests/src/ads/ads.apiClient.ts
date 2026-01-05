// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { getTestRunId } from "@villedemontreal/concurrent-api-tests";
import { UserRole } from "../shared/commonTests/UserRole";
import { IAds } from "../shared/taxiRegistryDtos/taxiRegistryDtos";
import { postTaxiRegistry } from "../shared/taxiRegistryHttp/taxiRegistryHttp";
import { getImmutableUserApiKey } from "../users/user.sharedFixture";
import { copyAdsOwnerTemplate } from "./adsDto.template";

export async function createAds(apiKey?: string, dto?: (x: IAds) => void) {
  const dtoCreateAds = copyAdsOwnerTemplate(dto);
  const responseAds = await postAds(dtoCreateAds, apiKey);
  return responseAds.body;
}

export async function postAds(dto: IAds, apiKey?: string) {
  if (dto && dto.data && dto.data[0].numero === "auto") {
    dto.data[0].numero = generateAutoNumeroAds();
  }

  const defaultApiKey = await getImmutableUserApiKey(UserRole.Operator);
  return await postTaxiRegistry("/api/ads/", dto, apiKey, defaultApiKey);
}

let numeroAdsSeed = 0;

export function generateAutoNumeroAds(): string {
  const newEmail = `${getTestRunId()}-${numeroAdsSeed}`;
  numeroAdsSeed++;

  return newEmail;
}

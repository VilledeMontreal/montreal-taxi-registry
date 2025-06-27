// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { UserRole } from "../shared/commonTests/UserRole";
import { getTaxiRegistry } from "../shared/taxiRegistryHttp/taxiRegistryHttp";
import { getImmutableUserApiKey } from "../users/user.sharedFixture";

export async function getFeed(apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Motor);
  return await getTaxiRegistry("/api/gofs-lite/", apiKey, defaultApiKey);
}

export async function getRealtimeBooking(params: string, apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Motor);
  return await getTaxiRegistry(
    `/api/gofs-lite/1/en/realtime_booking${params}`,
    apiKey,
    defaultApiKey
  );
}

export async function getServiceBrands(apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Motor);
  return await getTaxiRegistry(
    "/api/gofs-lite/1/en/service_brands.json",
    apiKey,
    defaultApiKey
  );
}

export async function getSystemInformation(apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Motor);
  return await getTaxiRegistry(
    "/api/gofs-lite/1/en/system_information.json",
    apiKey,
    defaultApiKey
  );
}

export async function getZones(apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Motor);
  return await getTaxiRegistry(
    "/api/gofs-lite/1/en/zones.json",
    apiKey,
    defaultApiKey
  );
}

export async function getOperatingRules(apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Motor);
  return await getTaxiRegistry(
    "/api/gofs-lite/1/en/operating_rules.json",
    apiKey,
    defaultApiKey
  );
}

export async function getCalendars(apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Motor);
  return await getTaxiRegistry(
    "/api/gofs-lite/1/en/calendars.json",
    apiKey,
    defaultApiKey
  );
}

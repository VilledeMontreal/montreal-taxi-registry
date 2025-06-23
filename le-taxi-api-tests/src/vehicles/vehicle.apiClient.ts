// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { UserRole } from "../shared/commonTests/UserRole";
import { postTaxiRegistry } from "../shared/taxiRegistryHttp/taxiRegistryHttp";
import { getImmutableUserApiKey } from "../users/user.sharedFixture";
import { IVehicle } from "./../shared/taxiRegistryDtos/taxiRegistryDtos";
import { copyVehicleTemplate } from "./vehiclesDto.template";

export async function createVehicle(
  apiKey?: string,
  dto?: (x: IVehicle) => void
): Promise<IVehicle> {
  const dtoCreateVehicle = copyVehicleTemplate(dto);
  const { body } = await postVehicle(dtoCreateVehicle, apiKey);
  return body as unknown as IVehicle;
}

export async function postVehicle(dto: IVehicle, apiKey?: string) {
  if (dto && dto.data && dto.data[0].licence_plate === "auto") {
    dto.data[0].licence_plate = generateCommercialLicencePlate();
  }

  const defaultApiKey = await getImmutableUserApiKey(UserRole.Operator);
  const response = await postTaxiRegistry(
    "/api/vehicles/",
    dto,
    apiKey,
    defaultApiKey
  );
  return response;
}

let licencePlate = 0;

export function generateCommercialLicencePlate(): string {
  return generateLicencePlateWithPrefix("F");
}

export function generateStandardLicencePlate(): string {
  return generateLicencePlateWithPrefix("");
}

export function generateLegacyLicencePlate(): string {
  return generateLicencePlateWithPrefix("T");
}

export function generateLicencePlateWithPrefix(prefix: string): string {
  ++licencePlate;

  return `${prefix}${licencePlate.toString().padStart(6, "0")}`;
}

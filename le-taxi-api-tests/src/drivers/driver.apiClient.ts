// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { UserRole } from '../shared/commonTests/UserRole';
import { IDriver } from '../shared/taxiRegistryDtos/taxiRegistryDtos';
import { postTaxiRegistry } from '../shared/taxiRegistryHttp/taxiRegistryHttp';
import { getImmutableUserApiKey } from '../users/user.sharedFixture';
import { copyDriverTemplate } from './driverDto.template';

export async function createDriver(apiKey?: string, dto?: (x: IDriver) => void) {
  const dtoCreateDriver = copyDriverTemplate(dto);
  const responseDriver = await postDriver(dtoCreateDriver, apiKey);
  return responseDriver.body;
}

export async function postDriver(dto: IDriver, apiKey?: string) {
  if (dto && dto.data && dto.data[0].professional_licence === 'auto') {
    dto.data[0].professional_licence = await getProfessionalLicence();
  }

  const defaultApiKey = await getImmutableUserApiKey(UserRole.Operator);
  return await postTaxiRegistry('/api/drivers/', dto, apiKey, defaultApiKey);
}
let professionalLicence = 0;

export function getProfessionalLicence(): string {
  ++professionalLicence;

  return professionalLicence.toString().padStart(6, '0');
}

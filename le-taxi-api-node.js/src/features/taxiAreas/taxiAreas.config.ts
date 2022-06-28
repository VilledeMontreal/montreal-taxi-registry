// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { configs } from '../../config/configs';
import { getAbsoluteUrl } from '../../utils/configs/system';

function getTaxiAreasUrl() {
  const taxiAreasUrl = configs.taxiAreas.openDataUrl;
  return taxiAreasUrl.startsWith('/') ? getAbsoluteUrl('') + taxiAreasUrl : taxiAreasUrl;
}

export const taxiAreasUrl = getTaxiAreasUrl();

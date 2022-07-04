// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { configs } from '../../config/configs';
import { getAbsoluteUrl } from '../../utils/configs/system';

function getTaxiAreasUrl() {
  const openDataUrl = configs.taxiAreas.openDataUrl;
  return openDataUrl.startsWith('/') ? getAbsoluteUrl('') + openDataUrl : openDataUrl;
}

export const taxiAreasUrl = getTaxiAreasUrl();

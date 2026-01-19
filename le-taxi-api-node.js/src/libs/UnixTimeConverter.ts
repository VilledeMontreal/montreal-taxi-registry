// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import moment from 'moment';
import { isUtcIsoString } from '../features/shared/dateUtils/dateUtils';

export class UnixTimeConverter {
  replaceInObjectArray(arrObj: Array<any>) {
    arrObj.forEach(function (obj) {
      Object.keys(obj).forEach(function (key, index) {
        if (isUtcIsoString(obj[key])) {
          obj[key] = moment(obj[key], moment.ISO_8601).local().format('YYYY-MM-DD HH:mm:ss');
        }
      });
    });
  }
}

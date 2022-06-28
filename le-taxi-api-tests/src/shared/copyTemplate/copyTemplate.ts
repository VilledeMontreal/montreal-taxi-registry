// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as _ from 'lodash';

export type InitTemplate<T> = (templateCopy: T) => void;
export type CopyTemplate<T> = (init?: InitTemplate<T>) => T;

export function defineCopyTemplate<T>(template: T): CopyTemplate<T> {
  return (init?: InitTemplate<T>) => {
    const templateCopy = _.cloneDeep<T>(template);
    if (init) {
      init(templateCopy);
    }
    return templateCopy;
  };
}

export function defineCopyTemplateVariation<T>(
  originalCopyTemplate: CopyTemplate<T>,
  variation: InitTemplate<T>
): CopyTemplate<T> {
  return (init?: InitTemplate<T>) => {
    return originalCopyTemplate((templateCopy: T) => {
      variation(templateCopy);
      if (init) {
        init(templateCopy);
      }
    });
  };
}

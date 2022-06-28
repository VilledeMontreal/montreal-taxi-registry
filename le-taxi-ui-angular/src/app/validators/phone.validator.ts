// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { AbstractControl, ValidatorFn } from '@angular/forms';

export function validatePhone(): ValidatorFn {
  const PHONE_REGEXP = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;

  return (control: AbstractControl): { [key: string]: any } => {
    const valid = PHONE_REGEXP.test(control.value);
    return valid ? null : { validatePhone: { valid: false } };
  };
}

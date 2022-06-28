// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { AbstractControl, ValidatorFn } from '@angular/forms';

export function validateEmail(): ValidatorFn {
  // tslint:disable-next-line:max-line-length
  const EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return (control: AbstractControl): { [key: string]: any } => {
    const valid = EMAIL_REGEXP.test(control.value);
    return valid ? null : { validateEmail: { valid: false } };
  };
}

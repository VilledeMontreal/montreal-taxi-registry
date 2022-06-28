// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { MdDateFormats, NativeDateAdapter } from '@angular/material';

export class CustomDateAdapter extends NativeDateAdapter {
  monthNames = {
    long: [
      'janvier',
      'février',
      'mars',
      'avril',
      'mai',
      'juin',
      'juillet',
      'août',
      'septembre',
      'octobre',
      'novembre',
      'décembre'
    ],
    short: [
      'jan',
      'fév',
      'mars',
      'avr',
      'mai',
      'juin',
      'juil',
      'août',
      'sept',
      'oct',
      'nov',
      'déc'
    ],
    narrow: [
      'ja',
      'fé',
      'mr',
      'av',
      'ma',
      'jn',
      'jl',
      'ao',
      'se',
      'oc',
      'no',
      'dé'
    ]
  };

  format(date: Date, displayFormat: Object): string {
    const displayMonth =
      displayFormat === 'input'
        ? this.toTwoDigits(date.getMonth() + 1)
        : this.monthNames.short[date.getMonth()];
    return (
      this.toTwoDigits(date.getDate()) +
      '-' +
      displayMonth +
      '-' +
      date.getFullYear()
    );
  }

  parse(value: any): Date | null {
    if (typeof value === 'string' && value.indexOf('-') > -1) {
      const str = value.split('-');

      const year = Number(str[2]);
      const month = Number(str[1]) - 1;
      const day = Number(str[0]);

      return new Date(year, month, day);
    }

    const timestamp = typeof value === 'number' ? value : Date.parse(value);
    return isNaN(timestamp) ? null : new Date(timestamp);
  }

  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    return this.monthNames[style];
  }

  private toTwoDigits(n: number): string {
    return ('00' + n).slice(-2);
  }
}

export const APP_DATE_FORMAT: MdDateFormats = {
  parse: {
    dateInput: { day: 'numeric', month: 'short', year: 'numeric' }
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { month: 'numeric', year: 'numeric' },
    dateA11yLabel: { day: 'numeric', month: 'short', year: 'numeric' },
    monthYearA11yLabel: { month: 'numeric', year: 'numeric' }
  }
};

// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
// Util functions to help dealing with dates.
// Avoid Local time and use a string representation of IsoString instead
// which is always UTC and follows the YYYY-MM-DDTHH:mm:ss.sssZ format.

// Assumes the date is UTC if no timezone provided
function asUtcIsoString(date: string): string {
  if (!date) return date;

  const localDate = toLocalDate(date);

  if (hasTimeZone(date)) return localDate.toISOString();

  return new Date(
    Date.UTC(
      localDate.getFullYear(),
      localDate.getMonth(),
      localDate.getDate(),
      localDate.getHours(),
      localDate.getMinutes(),
      localDate.getSeconds(),
      localDate.getMilliseconds()
    )
  ).toISOString();
}

// Assumes the date is Local if no timezone provided
function toUtcIsoString(date: string): string {
  if (!date) return date;

  return toLocalDate(date).toISOString();
}

function nowUtcIsoString(): string {
  return new Date(Date.now()).toISOString();
}

function isUtcIsoString(value: string) {
  const isoStringRegEx = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d{3}Z$/;
  return isoStringRegEx.test(value);
}

function isIsoDate(value: string) {
  const isoStringRegEx = /^\d{4}-[01]\d-[0-3]\d$/;
  return isoStringRegEx.test(value);
}

function toUtcHumanDate(date: string) {
  const localDate = toLocalDate(date);
  return localDate.toUTCString().replace('GMT', '-0000');
}

function hasTimeZone(value: string) {
  const timeZoneRegEx = /([+-][01]\d:?[0-5]\d)|Z$/;
  return timeZoneRegEx.test(value);
}

function isValidDate(date: Date): boolean {
  return !isNaN(date.getTime());
}

function toLocalDate(date: string): Date {
  const localDate = new Date(date);
  if (!isValidDate(localDate)) throw new Error(`Unable to convert date: ${date}`);
  return localDate;
}

function durationInSeconds(startDate: string, endDate: string): number {
  return (new Date(endDate).getTime() - new Date(startDate).getTime()) / 1000;
}

function addToDate(callback: (d: Date, n: number) => void, date: string, value: number): string {
  if (!isUtcIsoString(date)) throw new Error(`Date must be in UtcIsoString format: ${date}`);
  const newDate = new Date(date);
  callback(newDate, value);
  return newDate.toISOString();
}

function addDays(date: string, days: number): string {
  return addToDate((d, n) => d.setDate(d.getDate() + n), date, days);
}

function addHours(date: string, hours: number): string {
  return addToDate(
    (d, n) => d.setUTCHours(d.getUTCHours() + n, d.getMinutes(), d.getSeconds(), d.getMilliseconds()),
    date,
    hours
  );
}

function addMinutes(date: string, minutes: number): string {
  return addToDate((d, n) => d.setMinutes(d.getMinutes() + n, d.getSeconds(), d.getMilliseconds()), date, minutes);
}

function addSec(date: string, sec: number): string {
  return addToDate((d, n) => d.setSeconds(d.getSeconds() + n, d.getMilliseconds()), date, sec);
}

function addMS(date: string, ms: number): string {
  return addToDate((d, n) => d.setMilliseconds(d.getMilliseconds() + n), date, ms);
}

export {
  asUtcIsoString,
  toUtcIsoString,
  toUtcHumanDate,
  nowUtcIsoString,
  isUtcIsoString,
  isIsoDate,
  durationInSeconds,
  addDays,
  addHours,
  addMinutes,
  addSec,
  addMS
};

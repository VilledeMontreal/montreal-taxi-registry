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

function nowAsEpoch(): number {
  return Math.round(Date.now() / 1000);
}

function isUtcIsoString(value: string) {
  const isoStringRegEx =
    /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d{3}Z$/;
  return isoStringRegEx.test(value);
}

function isIsoDate(value: string) {
  const isoStringRegEx = /^\d{4}-[01]\d-[0-3]\d$/;
  return isoStringRegEx.test(value);
}

function toUtcHumanDate(date: string) {
  const localDate = toLocalDate(date);
  return localDate.toUTCString().replace("GMT", "-0000");
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
  if (!isValidDate(localDate))
    throw new Error(`Unable to convert date: ${date}`);
  return localDate;
}

function durationInSeconds(startDate: string, endDate: string): number {
  return (new Date(endDate).getTime() - new Date(startDate).getTime()) / 1000;
}

function addToDate(
  callback: (d: Date, n: number) => void,
  date: string,
  value: number
): string {
  if (!isUtcIsoString(date))
    throw new Error(`Date must be in UtcIsoString format: ${date}`);
  const newDate = new Date(date);
  callback(newDate, value);
  return newDate.toISOString();
}

function addYears(date: string, years: number): string {
  return addToDate(
    (d, n) => d.setUTCFullYear(d.getUTCFullYear() + n),
    date,
    years
  );
}

function addMonths(date: string, months: number): string {
  return addToDate((d, n) => d.setUTCMonth(d.getUTCMonth() + n), date, months);
}

function addDays(date: string, days: number): string {
  return addToDate((d, n) => d.setDate(d.getDate() + n), date, days);
}

function addHours(date: string, hours: number): string {
  return addToDate(
    (d, n) =>
      d.setUTCHours(
        d.getUTCHours() + n,
        d.getMinutes(),
        d.getSeconds(),
        d.getMilliseconds()
      ),
    date,
    hours
  );
}

function addMinutes(date: string, minutes: number): string {
  return addToDate(
    (d, n) =>
      d.setMinutes(d.getMinutes() + n, d.getSeconds(), d.getMilliseconds()),
    date,
    minutes
  );
}

function addSec(date: string, sec: number): string {
  return addToDate(
    (d, n) => d.setSeconds(d.getSeconds() + n, d.getMilliseconds()),
    date,
    sec
  );
}

function addMS(date: string, ms: number): string {
  return addToDate(
    (d, n) => d.setMilliseconds(d.getMilliseconds() + n),
    date,
    ms
  );
}

function getDate(date: string): string {
  if (!isUtcIsoString(date))
    throw new Error(`Date must be in UtcIsoString format: ${date}`);
  return date.split("T")[0];
}

function getDateNoDash(date: string) {
  return getDate(date).replace(/-/g, "");
}

function getTime(date: string): string {
  if (!isUtcIsoString(date))
    throw new Error(`Date must be in UtcIsoString format: ${date}`);
  return date.split("T")[1];
}

function getTimeNoDash(date: string) {
  return getTime(date).replace(/-/g, "");
}

export {
  asUtcIsoString,
  toUtcIsoString,
  toUtcHumanDate,
  toLocalDate,
  nowUtcIsoString,
  nowAsEpoch,
  isUtcIsoString,
  isIsoDate,
  durationInSeconds,
  addYears,
  addMonths,
  addDays,
  addHours,
  addMinutes,
  addSec,
  addMS,
  getDate,
  getTime,
  getDateNoDash,
  getTimeNoDash,
};

// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export default function unixTimeToDate(UNIX_timestamp: number) {
  const d = new Date(UNIX_timestamp * 1000);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];
  const year = d.getFullYear();
  const month = months[d.getMonth()];
  const date = d.getDate();
  const hour = d.getHours();
  const min = d.getMinutes();
  const sec = d.getSeconds();
  return `${date} ${month} ${year} ${hour}:${min}:${sec}`;
}

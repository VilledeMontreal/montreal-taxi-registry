// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export function encodeAddress(address: string): string {
  return typeof address !== "undefined" ? encodeURIComponent(address) : "";
}

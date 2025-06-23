// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export function generateEtag(date: string): string {
  return Buffer.from(date).toString("base64");
}

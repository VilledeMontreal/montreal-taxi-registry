// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export function isInEnum<T extends object>(value: string, enumType: T): boolean {
  return Object.values(enumType).includes(value);
}

export function ensureIsInEnum<T extends object>(valueIdentifier: string, value: string, enumType: T): void {
  if (!isInEnum(value, enumType)) {
    throw new Error(
      `${valueIdentifier} (value: ${value}) must be one of these values: (${enumValuesToString(enumType)})`
    );
  }
}

export function enumValuesToString<T extends object>(enumType: T) {
  return Object.values(enumType).join(', ');
}

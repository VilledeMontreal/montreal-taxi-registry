// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export class EntityVerificationResult {
  public static notFound(): EntityVerificationResult {
    return {
      entityExists: false,
      entityId: null,
    };
  }
  public static found(entityId: number): EntityVerificationResult {
    return {
      entityExists: true,
      entityId,
    };
  }
  public readonly entityExists: boolean;
  public readonly entityId: number;
}

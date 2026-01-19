// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
// eslint-disable max-classes-per-file

import { StatusCodes } from "http-status-codes";

export class CustomError extends Error {
  private _httpStatusCode: number;
  public get httpStatusCode(): number {
    return this._httpStatusCode;
  }
  public get tag(): string {
    return "CustomError";
  }
  constructor(message: string, httpStatusCode: number) {
    super(message);
    this._httpStatusCode = httpStatusCode;
  }
}

export class NotModifiedError extends CustomError {
  constructor(message: string) {
    super(message, StatusCodes.NOT_MODIFIED);
  }
}

export class BadRequestError extends CustomError {
  constructor(message: string) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string) {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string) {
    super(message, StatusCodes.NOT_FOUND);
  }
}

export class ConflictRequestError extends CustomError {
  constructor(message: string) {
    super(message, StatusCodes.CONFLICT);
  }
}

export class InternalServerError extends CustomError {
  constructor(message: string) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export class MultipleIssuesError extends CustomError {
  public readonly issues: string[];
  public get tag(): string {
    return "MultipleIssuesError";
  }
  constructor(message: string, issues: string[]) {
    super(message, StatusCodes.BAD_REQUEST);
    this.issues = issues;
  }
}

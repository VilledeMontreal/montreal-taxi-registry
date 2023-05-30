// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request } from 'express';
import { BadRequestError } from '../errorHandling/errors';
import { UserModel } from '../users/user.model';
import { userRepository } from '../users/user.repository';
import { UserRole } from '../users/userRole';

export async function validateUserId(request: Request): Promise<UserModel> {
  if (!request.params.id) throw new BadRequestError('An id must be provided.');
  return await userRepository.getUserById(request.params.id);
}

export function validateUserForDeepLinks(user: UserModel) {
  if (user.role_name !== UserRole.Operator) {
    throw new BadRequestError('GTFS Deep links can only be generated for operators');
  }
  if (!user.public_id) throw new BadRequestError('Operators must be provided with a public_id');
}

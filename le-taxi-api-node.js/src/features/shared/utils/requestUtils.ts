// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request } from 'express';
import { UserRole } from '../../users/userRole';

export function getOperator(request: Request) {
  return request.userModel.role_name === UserRole.Operator
    ? request.userModel.email
    : (request.query.operator as string);
}

// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from '../../models/route.model';
import { buildApiEndpoint } from '../shared/utils/apiUtils';
import { usersController } from './user.controller';

export function getUsersRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/legacy-web/users'),
      handler: usersController.getUsers
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/legacy-web/users/count'),
      handler: usersController.getUsersCount
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/legacy-web/roles'),
      handler: usersController.getRoles
    },
    {
      method: HttpMethods.POST,
      path: buildApiEndpoint('/api/legacy-web/users'),
      handler: usersController.createUser
    },
    {
      method: HttpMethods.PUT,
      path: buildApiEndpoint('/api/legacy-web/users'),
      handler: usersController.updateUser
    },
    {
      method: HttpMethods.DELETE,
      path: buildApiEndpoint('/api/legacy-web/users'),
      handler: usersController.deleteUser
    },
    {
      method: HttpMethods.PUT,
      path: buildApiEndpoint('/api/legacy-web/users/password'),
      handler: usersController.updatePassword
    },
    {
      method: HttpMethods.PUT,
      path: buildApiEndpoint('/api/legacy-web/users/apikey'),
      handler: usersController.updateApikey
    }
  ];
}

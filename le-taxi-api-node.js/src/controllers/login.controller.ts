// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as Cookies from 'cookies';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { constants } from '../config/constants';
import { menu } from '../config/menu';
import { BadRequestError, UnauthorizedError } from '../features/errorHandling/errors';
import { buildApiEndpoint } from '../features/shared/utils/apiUtils';
import { allow } from '../features/users/securityDecorator';
import { AuthenticatedUser } from '../features/users/user.model';
import { userRepository } from '../features/users/user.repository';
import { UserRole } from '../features/users/userRole';
import { security } from '../libs/security';

const defaultResponseHeaders = constants.defaultResponseHeaders;

export class controller {
  constructor(app) {
    app.get(buildApiEndpoint('/api/legacy-web/login/logout'), this.logout);
    app.post(buildApiEndpoint('/api/legacy-web/login/DoLogin'), this.DoLogin);
    app.get(buildApiEndpoint('/api/legacy-web/menu'), this.menu);
    app.get(buildApiEndpoint('/api/legacy-web/login/userinfo'), this.userInfo);
  }

  public logout(req: Request, res: Response, next: NextFunction) {
    res.clearCookie('access_token');
    res.status(StatusCodes.OK);
    res.end();
  }

  @allow([UserRole.Admin, UserRole.Manager, UserRole.Inspector])
  public userInfo({ userModel }: Request, res: Response, next: NextFunction) {
    if (userModel) {
      res.writeHead(StatusCodes.OK, defaultResponseHeaders);
      res.write(JSON.stringify(userModel));
      res.end();
    } else {
      throw new BadRequestError('User not found.');
    }
  }

  public DoLogin(request: Request, response: Response, next: NextFunction) {
    const username = request.body.login;
    const password = request.body.password;
    if (username && password) {
      userRepository
        .getUserForAuthentication(username) // In our case, the user's email is the username.
        .then(function (user: AuthenticatedUser) {
          if (!user) {
            throw new UnauthorizedError('No user was found with this username. Verify the username and try again.');
          }
          if (security.check(password, user['password'])) {
            let token = security.createJwt(user);
            new Cookies(request, response).set('access_token', token, { maxAge: 60 * 60 * 24 * 1000, httpOnly: true });
            response.writeHead(StatusCodes.OK);
            response.end();
          } else {
            throw new UnauthorizedError('The password is invalid for this user.');
          }
        })
        .catch(next);
    } else {
      throw new BadRequestError('Missing parameters');
    }
  }

  @allow([UserRole.Admin, UserRole.Manager, UserRole.Inspector])
  public menu(req: Request, res: Response, next: NextFunction) {
    const currentUserRole = req.userModel.role_name;
    const menuByRole = menu[currentUserRole];

    if (!menuByRole) {
      throw new UnauthorizedError(`No menu for role ${currentUserRole}`);
    }

    res.writeHead(StatusCodes.OK, defaultResponseHeaders);
    res.write(JSON.stringify(menuByRole));
    res.end();
  }
}

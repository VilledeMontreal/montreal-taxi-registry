// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { allow } from './securityDecorator';
import { userRepository } from './user.repository';
import {
  prepareDtoForInsertion,
  prepareDtoForUpdate,
  validateUpdateApikeyRequest,
  validateUpdatePasswordRequest,
  validateUserRequest
} from './user.validators';
import { UserRole } from './userRole';

class UsersController {
  @allow([UserRole.Admin, UserRole.Manager])
  public async getUsers(request: Request, response: Response) {
    const userId = request.query.id as string;
    if (userId) {
      const user = await userRepository.getUserById(userId);
      response.status(StatusCodes.OK);
      response.json([user]);
    } else {
      const users = await userRepository.getUsersPaginated(
        request.query.page as string,
        request.query.pagesize as string,
        request.query.order as string
      );
      response.json(users);
    }
  }

  @allow([UserRole.Admin, UserRole.Manager])
  public async getUsersCount(request: Request, response: Response) {
    const count = await userRepository.getUsersCount();
    response.status(StatusCodes.OK);
    response.json(count);
  }

  @allow([UserRole.Admin, UserRole.Manager])
  public async getRoles(request: Request, response: Response) {
    const roles = await userRepository.getRoles();
    response.status(StatusCodes.OK);
    response.json(roles);
  }

  @allow([UserRole.Admin, UserRole.Manager])
  public async createUser(request: Request, response: Response) {
    const userRequestDto = await validateUserRequest(request);
    const userRequestDtoForInsertion = prepareDtoForInsertion(userRequestDto);
    const userModel = await userRepository.createUser(userRequestDtoForInsertion, request.userModel);
    response.status(StatusCodes.OK);
    response.json(userModel);
  }

  @allow([UserRole.Admin, UserRole.Manager])
  public async updateUser(request: Request, response: Response) {
    const userRequestDto = await validateUserRequest(request);
    const userRequestDtoForUpdate = await prepareDtoForUpdate(userRequestDto);
    const userModel = await userRepository.updateUser(userRequestDtoForUpdate, request.userModel);
    response.status(StatusCodes.OK);
    response.json(userModel);
  }

  @allow([UserRole.Admin, UserRole.Manager])
  public async deleteUser(request: Request, response: Response) {
    const userId = request.query.id as string;
    await userRepository.deleteUser(userId);
    response.sendStatus(StatusCodes.OK);
  }

  @allow([UserRole.Admin, UserRole.Manager])
  public async updatePassword(request: Request, response: Response) {
    const { userId, password } = await validateUpdatePasswordRequest(request);
    const userModel = await userRepository.updatePassword(userId, password);
    response.status(StatusCodes.OK);
    response.json(userModel);
  }

  @allow([UserRole.Admin, UserRole.Manager])
  public async updateApikey(request: Request, response: Response) {
    const { userId, apikey } = await validateUpdateApikeyRequest(request);
    const userModel = await userRepository.updateApikey(userId, apikey);
    response.status(StatusCodes.OK);
    response.json(userModel);
  }
}

export const usersController = new UsersController();

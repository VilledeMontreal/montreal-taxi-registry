// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as assert from 'assert';
import { QueryResult } from 'pg';
import { security } from '../../libs/security';
import { BadRequestError, UnauthorizedError } from '../errorHandling/errors';
import { postgrePool } from '../shared/taxiPostgre/taxiPostgre';
import {
  deleteUserRole,
  disableUser,
  getRoles,
  getUserByApikey,
  getUserById,
  getUserForAuthentication,
  getUsersByRole,
  getUsersCount,
  getUsersForIntegrationTools,
  getUsersPaginated,
  insertUser,
  insertUserRole,
  updateApikey,
  updatePassword,
  updateUser
} from './user.constants';
import { UserRequestDto } from './user.dto';
import { UserModel } from './user.model';
import { UserRole } from './userRole';

class UserRepository {
  public async getUserById(id: string): Promise<UserModel> {
    const queryResult = await postgrePool.query<UserModel>(getUserById, [id]);
    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      return null;
    }
    assert.ok(
      queryResult.rowCount === 0 || queryResult.rowCount === 1,
      'More than one user was found with the same id.'
    );
    return queryResult.rows[0];
  }

  public async getUserByApiKey(apikey: string): Promise<UserModel> {
    const cipher = security.encrypt(apikey);
    const queryResult = await postgrePool.query<UserModel>(getUserByApikey, [cipher]);
    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      return null;
    }
    assert.ok(
      queryResult.rowCount === 0 || queryResult.rowCount === 1,
      'More than one user was found with the same api key.'
    );
    return queryResult.rows[0];
  }

  public async getUserForAuthentication(email: string): Promise<UserModel> {
    const queryResult: QueryResult = await postgrePool.query<UserModel>(getUserForAuthentication, [email]);
    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      return null;
    }
    return queryResult.rows[0];
  }

  public async getUserForIntegrationTools(id: number): Promise<UserModel> {
    const queryResult: QueryResult = await postgrePool.query<UserModel>(getUsersForIntegrationTools, [id]);
    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      return null;
    }
    return queryResult.rows[0];
  }

  public async getUsersByRole(role: UserRole): Promise<UserModel[]> {
    const queryResult: QueryResult = await postgrePool.query<UserModel>(getUsersByRole, [role]);
    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      return null;
    }
    return queryResult.rows;
  }

  public async getUsersPaginated(
    pageNumber: string = null,
    pageSize: string = null,
    order: string = null
  ): Promise<UserModel[]> {
    const orderByClause = translateOrderByClause(order);
    const query = getUsersPaginated.replace('%ORDER_BY_CLAUSE%', orderByClause);
    const queryResult = await postgrePool.query<UserModel>(query, [pageNumber, pageSize]);
    if (!queryResult || !queryResult.rows || !queryResult.rows.length) return null;
    return queryResult.rows;
  }

  public async getUsersCount(): Promise<any> {
    const queryResult = await postgrePool.query(getUsersCount);
    if (!queryResult || !queryResult.rows || !queryResult.rows.length) return null;
    return queryResult.rows[0].count;
  }

  public async getRoles(): Promise<any[]> {
    const queryResult = await postgrePool.query(getRoles);
    if (!queryResult || !queryResult.rows || !queryResult.rows.length) return null;
    return queryResult.rows;
  }

  public async createUser(userRequestDto: UserRequestDto, userModel: UserModel): Promise<UserModel> {
    const passwordCipher = security.encrypt(userRequestDto.password);
    const apikeyCipher = security.encrypt(userRequestDto.apikey);
    const queryResult = await executeQueryAndHandleDuplicate(() =>
      postgrePool.query(insertUser, [JSON.stringify(userRequestDto), passwordCipher, apikeyCipher])
    );

    if (!queryResult || !queryResult.rows) return null;

    const userId = queryResult.rows[0].id;
    await this.setUserRole(userId, userRequestDto.role, userModel.role);

    const user = await this.getUserById(userId);
    user.password = userRequestDto.password;
    user.apikey = userRequestDto.apikey;
    return user;
  }

  public async updateUser(userRequestDto: UserRequestDto, userModel: UserModel): Promise<UserModel> {
    const queryResult = await executeQueryAndHandleDuplicate(() =>
      postgrePool.query(updateUser, [JSON.stringify(userRequestDto), userRequestDto.id])
    );
    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) return null;

    const userId = queryResult.rows[0].id;
    await this.setUserRole(userId, userRequestDto.role, userModel.role);
    return await this.getUserById(userId);
  }

  public async deleteUser(userId: string): Promise<void> {
    await postgrePool.query(disableUser, [userId]);
  }

  public async updatePassword(userId: string, password: string): Promise<UserModel> {
    const cipher = security.encrypt(password);
    await postgrePool.query(updatePassword, [userId, cipher]);
    const user = await this.getUserById(userId);
    user.password = password;
    return user;
  }

  public async updateApikey(userId: string, apikey: string): Promise<UserModel> {
    const cipher = security.encrypt(apikey);
    await postgrePool.query(updateApikey, [userId, cipher]);
    const user = await this.getUserById(userId);
    user.apikey = apikey;
    return user;
  }

  private async setUserRole(userId: string, role: number, originalRole: number): Promise<void> {
    const canChangeUserRole = await this.canChangeUserRole(role, originalRole);
    if (!canChangeUserRole) throw new UnauthorizedError('Changing role not allowed');

    await this.removeUserRole(userId);
    await postgrePool.query(insertUserRole, [userId, role]);
  }

  private async removeUserRole(userId: string): Promise<void> {
    await postgrePool.query(deleteUserRole, [userId]);
  }

  private async canChangeUserRole(desiredRole: number, originalRole: number): Promise<boolean> {
    const roles = await this.getRoles();
    const desiredRoleName = roles.find(role => role.id === desiredRole)?.name;
    const originalRoleName = roles.find(role => role.id === originalRole)?.name;

    if (!desiredRoleName || !originalRoleName) return false;

    return (
      originalRoleName === UserRole.Admin ||
      (originalRoleName === UserRole.Manager && desiredRoleName !== UserRole.Admin)
    );
  }
}

function translateOrderByClause(order: string): string {
  if (!order) return '';

  const column = order.includes('role') ? 'r.name' : order.includes('commercial') ? 'u.commercial_name' : 'u.email';
  const direction = order.includes('desc') ? ' DESC' : ' ASC';

  return `ORDER BY ${column} ${direction}`;
}

async function executeQueryAndHandleDuplicate(query: () => Promise<QueryResult>) {
  try {
    return await query();
  } catch (err) {
    if (err.message.includes(`duplicate key value violates unique constraint`))
      throw new BadRequestError('Operator public_id must be unique');
    else throw err;
  }
}

export const userRepository = new UserRepository();

// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Pool } from 'pg';
import { configs } from '../../../config/configs';

export const postgrePool = new Pool({ ...configs.dataSources.postgres });

// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { connectToMongoDb } from '../../../features/shared/taxiMongo/taxiMongo';

export async function mdb_1_0_0_test_script(): Promise<void> {
  const db = await connectToMongoDb();
  await db.collection('collection-to-be-remove').insertOne({ test: 'document-to-be-remove' });
}

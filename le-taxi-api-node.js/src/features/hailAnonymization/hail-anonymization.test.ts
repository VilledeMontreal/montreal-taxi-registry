// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as chai from 'chai';
import { StatusCodes } from 'http-status-codes';
import { configs } from '../../config/configs';
import { app } from '../../tests/init';
import { postgrePool } from '../shared/taxiPostgre/taxiPostgre';
import { buildApiEndpoint } from '../shared/utils/apiUtils';
import chaiHttp = require('chai-http');

const { customisedTaxis } = require('../../tests/integration-tests/apiIntegrationTests.sharedState.json');
const existingTaxi = customisedTaxis[0];
const nowUTC = new Date().toISOString();

const testOnlyCreateRecords = `
INSERT INTO 
  public.hail 
  (
    id,
    creation_datetime,
    taxi_id,
    status,
    customer_address,
    read_only_after
  )
VALUES 
  (
    '${existingTaxi}001',
    '2019-07-01T00:00:00.000Z',
    '${existingTaxi}',
    'finished',
    '1031 de la marche',
    '${nowUTC}'
  ),
  (
    '${existingTaxi}002',
    '2019-07-01T00:01:00.000Z',
    '${existingTaxi}',
    'timeout_taxi',
    '1032 de la marche',
    '${nowUTC}'
  ),
  (
    '${existingTaxi}003',
    '2019-07-01T00:02:00.000Z',
    '${existingTaxi}',
    'declined_by_customer',
    '1033 de la marche',
    '${nowUTC}'
  ),
  (
    '${existingTaxi}005',
    '2019-07-01T00:03:00.000Z',
    '${existingTaxi}',
    'accepted_by_taxi',
    '1035 de la marche',
    ${null}
  ),
  (
    '${existingTaxi}006',
    '2019-07-01T00:04:00.000Z',
    '${existingTaxi}',
    'accepted_by_customer',
    '1036 de la marche',
    ${null}
  )`;

const testOnlyDeleteRecords = `
DELETE FROM 
  public.hail
WHERE 
  id LIKE '${existingTaxi}%'
`;

chai.use(chaiHttp);
chai.should();

describe('Hails anonymize ----------- Roles -----------', () => {
  before(async () => {
    await onlyForTestDeleteRecords();
    await onlyForTestCreateRecords();
  });

  it('Should return valid response.', done => {
    chai
      .request(app)
      .post(buildApiEndpoint('/api/worker/hail-anonymization-tasks'))
      .set('X-API-Key', configs.apikeys.stats)
      .set('X-VERSION', '2')
      .set('Accept', 'Application/json')
      .end((err, res) => {
        res.should.have.status(StatusCodes.OK);
        res.body.should.be.a('object');
        res.body.should.have.property('status');
        res.body.should.have.property('modifiedRows');
        res.body.status.should.equal('succes');
        res.body.modifiedRows.should.least(3);
        done();
      });
  });

  after(async () => {
    await onlyForTestDeleteRecords();
  });
});

const onlyForTestCreateRecords = async () => {
  await postgrePool.query(testOnlyCreateRecords);
};

const onlyForTestDeleteRecords = async () => {
  await postgrePool.query(testOnlyDeleteRecords);
};

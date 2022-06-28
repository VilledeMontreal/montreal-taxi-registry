// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import { StatusCodes } from 'http-status-codes';
import { configs } from '../../config/configs';
import { postgrePool } from '../../features/shared/taxiPostgre/taxiPostgre';
import { getAbsoluteUrl } from '../../utils/configs/system';

const request = require('request');

const assert = chai.assert;
const expect = chai.expect;

chai.use(chaiHttp);

// TM-1524
describe.skip('TestsHails', () => {
  it('hailTestingData should work with apikey', done => {
    const options = {
      url: getAbsoluteUrl('/api/hailTestingData'),
      headers: {
        'X-API-KEY': configs.apikeys.operateur,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    };

    request.get(options, (err: any, res: any, body: any) => {
      assert.isNull(err);
      assert.equal(res.statusCode, StatusCodes.OK);
      done();
    });
  });

  it('hailTestingDone should work with apikey', done => {
    const options = {
      url: getAbsoluteUrl('/api/hailTestingDone'),
      headers: {
        'X-API-KEY': configs.apikeys.operateur,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    };

    request.get(options, (err: any, res: any, body: any) => {
      assert.isNull(err);
      assert.equal(res.statusCode, StatusCodes.OK);
      done();
    });
  });

  it('Hail Testing data should work with idOperator', done => {
    const OPERATOR_ID = 104;
    const options = {
      url: getAbsoluteUrl(`/api/hailTestingData/${OPERATOR_ID}`),
      headers: {
        'X-API-KEY': configs.apikeys.admin,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    };

    request.get(options, (err: any, res: any, body: any) => {
      assert.isNull(err);
      assert.equal(res.statusCode, StatusCodes.OK);
      done();
    });
  });

  it('A motor testing user should exists', () => {
    const engineName = 'motor_tester';
    postgrePool.query('select * from "user" where email=$1::text', [engineName], (err: any, result: any) => {
      if (err) {
        assert(false);
      }
      expect(result).to.not.be.an('undefined');
    });
  });
});

// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import { StatusCodes } from 'http-status-codes';
import { configs } from '../../config/configs';
import { app } from '../../tests/init';
import { buildApiEndpoint } from '../shared/utils/apiUtils';

chai.use(chaiHttp);
chai.should();

describe('Roles data dump ----------- Roles -----------', () => {
  it('Should return valid response. Role: STATS', done => {
    chai
      .request(app)
      .get(buildApiEndpoint('/api/data-dumps/roles'))
      .set('X-API-Key', configs.apikeys.stats)
      .set('X-VERSION', '2')
      .set('Accept', 'Application/json')
      .set('Accept-Encoding', 'gzip')
      .end((err, res) => {
        res.should.have.status(StatusCodes.OK);
        res.body.should.be.a('array');
        res.body[0].should.have.property('id');
        res.body[0].should.have.property('name');
        done();
      });
  });

  it('Should return valid response. Role: ADMIN', done => {
    chai
      .request(app)
      .get(buildApiEndpoint('/api/data-dumps/roles'))
      .set('X-API-Key', configs.apikeys.admin)
      .set('X-VERSION', '2')
      .set('Accept', 'Application/json')
      .set('Accept-Encoding', 'gzip')
      .end((err, res) => {
        res.should.have.status(StatusCodes.OK);
        res.body.should.be.a('array');
        res.body[0].should.have.property('id');
        res.body[0].should.have.property('name');
        done();
      });
  });

  it('Should return valid response. Role: GESTION', done => {
    chai
      .request(app)
      .get(buildApiEndpoint('/api/data-dumps/roles'))
      .set('X-API-Key', configs.apikeys.gestion)
      .set('X-VERSION', '2')
      .set('Accept', 'Application/json')
      .set('Accept-Encoding', 'gzip')
      .end((err, res) => {
        res.should.have.status(StatusCodes.OK);
        res.body.should.be.a('array');
        res.body[0].should.have.property('id');
        res.body[0].should.have.property('name');
        done();
      });
  });

  it('Should return Not authorized (http: 401). Role: OPERATEUR', done => {
    chai
      .request(app)
      .get(buildApiEndpoint('/api/data-dumps/roles'))
      .set('X-API-Key', configs.apikeys.operateur)
      .set('X-VERSION', '2')
      .set('Accept', 'Application/json')
      .set('Accept-Encoding', 'gzip')
      .end((err, res) => {
        res.should.have.status(StatusCodes.UNAUTHORIZED);
        done();
      });
  });
});

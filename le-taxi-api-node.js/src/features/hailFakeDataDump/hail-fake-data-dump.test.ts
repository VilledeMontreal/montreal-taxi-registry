// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as chai from 'chai';
import { StatusCodes } from 'http-status-codes';
import { configs } from '../../config/configs';
import { app } from '../../tests/init';
import { buildApiEndpoint } from '../shared/utils/apiUtils';
import { generatedFileName } from './hail-fake-data-dump.constants';
const fs = require('fs');
import chaiHttp = require('chai-http');

chai.use(chaiHttp);
chai.should();

const dataCreateUrl = buildApiEndpoint('/api/fake-data-dump/hails/build/2019-08-20T13:40:00.000Z');
const dataDumpUrl = buildApiEndpoint('/api/fake-data-dump/hails/2019-08-20T13:40:00.000Z');

describe('Hail fake data create ----------- Roles -----------', () => {
  before(async () => {
    await onlyForTestCreateFile();
  });

  it('Should return valid response. Role: STATS', done => {
    chai
      .request(app)
      .get(dataCreateUrl)
      .set('X-API-Key', configs.apikeys.stats)
      .set('X-VERSION', '2')
      .set('Accept', 'Application/json')
      .end((err, res) => {
        res.should.have.status(StatusCodes.OK);
        res.body.should.be.a('object');
        res.body.should.have.property('items');
        done();
      });
  });

  it('Should return Not authorized (http: 401). Role: OPERATEUR', done => {
    chai
      .request(app)
      .get(dataCreateUrl)
      .set('X-API-Key', configs.apikeys.operateur)
      .set('X-VERSION', '2')
      .set('Accept', 'Application/json')
      .end((err, res) => {
        res.should.have.status(StatusCodes.UNAUTHORIZED);
        done();
      });
  });
});

describe('Hail fake data dump ----------- Roles -----------', () => {
  it('Should return valid response. Role: STATS', done => {
    chai
      .request(app)
      .get(dataDumpUrl)
      .set('X-API-Key', configs.apikeys.stats)
      .set('X-VERSION', '2')
      .set('Accept', 'Application/json')
      .end((err, res) => {
        res.should.have.status(StatusCodes.OK);
        res.body.should.be.a('object');
        res.body.should.have.property('items');
        done();
      });
  });

  it('Should return valid response. Role: ADMIN', done => {
    chai
      .request(app)
      .get(dataDumpUrl)
      .set('X-API-Key', configs.apikeys.admin)
      .set('X-VERSION', '2')
      .set('Accept', 'Application/json')
      .end((err, res) => {
        res.should.have.status(StatusCodes.OK);
        res.body.should.be.a('object');
        res.body.should.have.property('items');
        done();
      });
  });

  it('Should return valid response. Role: GESTION', done => {
    chai
      .request(app)
      .get(dataDumpUrl)
      .set('X-API-Key', configs.apikeys.gestion)
      .set('X-VERSION', '2')
      .set('Accept', 'Application/json')
      .end((err, res) => {
        res.should.have.status(StatusCodes.OK);
        res.body.should.be.a('object');
        res.body.should.have.property('items');
        done();
      });
  });

  it('Should return Not authorized (http: 401). Role: OPERATEUR', done => {
    chai
      .request(app)
      .get(dataDumpUrl)
      .set('X-API-Key', configs.apikeys.operateur)
      .set('X-VERSION', '2')
      .set('Accept', 'Application/json')
      .end((err, res) => {
        res.should.have.status(StatusCodes.UNAUTHORIZED);
        done();
      });
  });

  after(async () => {
    await onlyForTestDeleteFile();
  });
});

const onlyForTestDeleteFile = async () => {
  try {
    fs.unlinkSync(generatedFileName);
  } catch {
    // tslint:disable-next-line: no-console
    console.log('Erreur. Effacer fichier');
  }
};

const onlyForTestCreateFile = async () => {
  try {
    fs.writeFileSync(generatedFileName, '');
  } catch (err) {
    // tslint:disable-next-line: no-console
    console.log('Erreur. Écrire fichier');
  }
};

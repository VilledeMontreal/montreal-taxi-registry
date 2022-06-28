// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from '../features/errorHandling/errors';
import { buildApiEndpoint } from '../features/shared/utils/apiUtils';
import { allow } from '../features/users/securityDecorator';
import { FakeOperatorService } from '../services/fake-operator.service';

export class controller {
  constructor(app) {
    //endpoint operateur hail appelé par python (param auth)
    // Trouver api-key du fake operateur.
    // put hail/id  par opérateur avec param
    // retourner le statut received_by_taxi

    app.post(buildApiEndpoint('/api/operator/endpoint'), this.operatorEndPoint);
  }

  @allow(['admin', 'operateur'])
  operatorEndPoint(req, res, next) {
    let hail: any = req.body;

    if (!hail) {
      next(new BadRequestError('The hail cannot be null'));
    }

    let a = new FakeOperatorService();
    a.doAction(hail.data[0].taxi.id, hail.data[0].id)
      .then(function (resp) {
        res.writeHeader(StatusCodes.OK, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(hail));
        res.end();
      })
      .catch(function (err) {
        next(new BadRequestError('erreur Fake Op: ' + req.body));
      });
  }
}

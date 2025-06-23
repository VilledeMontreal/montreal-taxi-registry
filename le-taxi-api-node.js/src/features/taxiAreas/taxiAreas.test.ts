// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as chai from "chai";
import { StatusCodes } from "http-status-codes";
import { configs } from "../../config/configs";
import { app } from "../../tests/init";
import { buildApiEndpoint } from "../shared/utils/apiUtils";
import { UserRole } from "../users/userRole";
import chaiHttp = require("chai-http");

chai.use(chaiHttp);
const expect = chai.expect;

describe("Taxi Areas ----------- Roles -----------", () => {
  testGetTaxiAreasUserAccessValid(configs.apikeys.admin, UserRole.Admin);
  testGetTaxiAreasUserAccessValid(configs.apikeys.gestion, UserRole.Manager);
  testGetTaxiAreasUserAccessValid(
    configs.apikeys.inspecteur,
    UserRole.Inspector
  );

  it("Should return Not authorized (http: 401). Role: STATS", () => {
    return chai
      .request(app)
      .get(buildApiEndpoint("/api/legacy-web/taxi-areas"))
      .set("X-API-Key", configs.apikeys.stats)
      .catch((err) => expect(err).to.have.status(StatusCodes.UNAUTHORIZED));
  });
});

function testGetTaxiAreasUserAccessValid(apikey: string, role: string) {
  it(`Should return valid response. Role: ${role}`, () => {
    return chai
      .request(app)
      .get(buildApiEndpoint("/api/legacy-web/taxi-areas"))
      .set("X-API-Key", apikey)
      .then((res) => {
        expect(res).to.have.status(StatusCodes.OK);
        expect(res?.body).to.have.property("features");
      });
  });
}

// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { LeTaxiFrontAngularPage } from './app.po';

describe('le-taxi-front-angular App', () => {
  let page: LeTaxiFrontAngularPage;

  beforeEach(() => {
    page = new LeTaxiFrontAngularPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});

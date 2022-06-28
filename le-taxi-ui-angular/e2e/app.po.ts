// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { browser, by, element } from 'protractor';

export class LeTaxiFrontAngularPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }
}

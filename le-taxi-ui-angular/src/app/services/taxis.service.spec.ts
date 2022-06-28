// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { TestBed, inject } from '@angular/core/testing';

import { TaxisService } from './taxis.service';

describe('TaxisService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaxisService]
    });
  });

  it('should be created', inject([TaxisService], (service: TaxisService) => {
    expect(service).toBeTruthy();
  }));
});

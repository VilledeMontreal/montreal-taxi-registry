// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { TestBed, inject } from '@angular/core/testing';

import { LibService } from './lib.service';

describe('LibService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LibService]
    });
  });

  it('should be created', inject([LibService], (service: LibService) => {
    expect(service).toBeTruthy();
  }));
});

// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { TestBed, inject } from '@angular/core/testing';

import { AccountService } from './account.service';

describe('AccountService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccountService]
    });
  });

  it('should be created', inject(
    [AccountService],
    (service: AccountService) => {
      expect(service).toBeTruthy();
    }
  ));
});

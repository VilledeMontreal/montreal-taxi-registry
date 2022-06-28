// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { TestBed, inject } from '@angular/core/testing';

import { LoginService } from './login.service';

describe('LoginService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoginService]
    });
  });

  it('should be created', inject([LoginService], (service: LoginService) => {
    expect(service).toBeTruthy();
  }));
});

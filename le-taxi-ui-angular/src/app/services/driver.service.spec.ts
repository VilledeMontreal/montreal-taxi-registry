// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { TestBed, inject } from '@angular/core/testing';

import { DriverService } from './driver.service';

describe('DriverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DriverService]
    });
  });

  it('should be created', inject([DriverService], (service: DriverService) => {
    expect(service).toBeTruthy();
  }));
});

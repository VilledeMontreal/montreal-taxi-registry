// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { TestBed, inject } from '@angular/core/testing';

import { VehicleService } from './vehicle.service';

describe('VehicleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VehicleService]
    });
  });

  it('should be created', inject(
    [VehicleService],
    (service: VehicleService) => {
      expect(service).toBeTruthy();
    }
  ));
});

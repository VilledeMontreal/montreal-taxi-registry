// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxisComponent } from './taxis.component';

describe('VehicleComponent', () => {
  let component: TaxisComponent;
  let fixture: ComponentFixture<TaxisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TaxisComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

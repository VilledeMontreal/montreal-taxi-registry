// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverComponent } from './driver.component';

describe('DriverComponent', () => {
  let component: DriverComponent;
  let fixture: ComponentFixture<DriverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DriverComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

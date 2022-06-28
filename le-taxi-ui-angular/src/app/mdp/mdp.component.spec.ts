// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MdpComponent } from './mdp.component';

describe('MdpComponent', () => {
  let component: MdpComponent;
  let fixture: ComponentFixture<MdpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MdpComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MdpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

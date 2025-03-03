import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsulterRFQComponent } from './consulter-rfq.component';

describe('ConsulterRFQComponent', () => {
  let component: ConsulterRFQComponent;
  let fixture: ComponentFixture<ConsulterRFQComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsulterRFQComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsulterRFQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

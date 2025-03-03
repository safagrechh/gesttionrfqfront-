import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRFQComponent } from './create-rfq.component';

describe('CreateRFQComponent', () => {
  let component: CreateRFQComponent;
  let fixture: ComponentFixture<CreateRFQComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRFQComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateRFQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

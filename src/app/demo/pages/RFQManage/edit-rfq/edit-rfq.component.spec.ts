import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRFQComponent } from './edit-rfq.component';

describe('EditRFQComponent', () => {
  let component: EditRFQComponent;
  let fixture: ComponentFixture<EditRFQComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditRFQComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditRFQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

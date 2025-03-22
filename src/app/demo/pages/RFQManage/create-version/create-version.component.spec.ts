import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateVersionComponent } from './create-version.component';

describe('CreateVersionComponent', () => {
  let component: CreateVersionComponent;
  let fixture: ComponentFixture<CreateVersionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateVersionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

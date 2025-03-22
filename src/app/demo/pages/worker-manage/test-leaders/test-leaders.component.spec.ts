import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestLeadersComponent } from './test-leaders.component';

describe('TestLeadersComponent', () => {
  let component: TestLeadersComponent;
  let fixture: ComponentFixture<TestLeadersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestLeadersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestLeadersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialLeadersComponent } from './material-leaders.component';

describe('MaterialLeadersComponent', () => {
  let component: MaterialLeadersComponent;
  let fixture: ComponentFixture<MaterialLeadersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialLeadersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialLeadersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

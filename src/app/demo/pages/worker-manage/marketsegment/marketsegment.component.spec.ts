import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketsegmentComponent } from './marketsegment.component';

describe('MarketsegmentComponent', () => {
  let component: MarketsegmentComponent;
  let fixture: ComponentFixture<MarketsegmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketsegmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketsegmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoBuyerComponent } from './auto-buyer.component';

describe('AutoBuyerComponent', () => {
  let component: AutoBuyerComponent;
  let fixture: ComponentFixture<AutoBuyerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutoBuyerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoBuyerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoBuyTabComponent } from './auto-buy-tab.component';

describe('AutoBuyTabComponent', () => {
  let component: AutoBuyTabComponent;
  let fixture: ComponentFixture<AutoBuyTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutoBuyTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoBuyTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

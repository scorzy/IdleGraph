import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestigeFooterComponent } from './prestige-footer.component';

describe('PrestigeFooterComponent', () => {
  let component: PrestigeFooterComponent;
  let fixture: ComponentFixture<PrestigeFooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrestigeFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrestigeFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

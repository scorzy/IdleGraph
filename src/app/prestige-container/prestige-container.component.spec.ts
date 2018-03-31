import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestigeContainerComponent } from './prestige-container.component';

describe('PrestigeContainerComponent', () => {
  let component: PrestigeContainerComponent;
  let fixture: ComponentFixture<PrestigeContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrestigeContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrestigeContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

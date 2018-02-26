import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoodeViewComponent } from './noode-view.component';

describe('NoodeViewComponent', () => {
  let component: NoodeViewComponent;
  let fixture: ComponentFixture<NoodeViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoodeViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoodeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

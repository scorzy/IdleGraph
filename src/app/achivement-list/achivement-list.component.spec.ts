import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AchivementListComponent } from './achivement-list.component';

describe('AchivementListComponent', () => {
  let component: AchivementListComponent;
  let fixture: ComponentFixture<AchivementListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AchivementListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AchivementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillStatsComponent } from './skill-stats.component';

describe('SkillStatsComponent', () => {
  let component: SkillStatsComponent;
  let fixture: ComponentFixture<SkillStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkillStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

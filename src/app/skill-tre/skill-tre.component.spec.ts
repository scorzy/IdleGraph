import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillTreComponent } from './skill-tre.component';

describe('SkillTreComponent', () => {
  let component: SkillTreComponent;
  let fixture: ComponentFixture<SkillTreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkillTreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillTreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

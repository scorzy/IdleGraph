import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeLineComponent } from './node-line.component';

describe('NodeLineComponent', () => {
  let component: NodeLineComponent;
  let fixture: ComponentFixture<NodeLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

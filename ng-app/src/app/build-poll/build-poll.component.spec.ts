import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildPollComponent } from './build-poll.component';

describe('BuildPollComponent', () => {
  let component: BuildPollComponent;
  let fixture: ComponentFixture<BuildPollComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildPollComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildPollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

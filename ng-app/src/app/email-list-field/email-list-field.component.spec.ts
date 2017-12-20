import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailListFieldComponent } from './email-list-field.component';

describe('EmailListFieldComponent', () => {
  let component: EmailListFieldComponent;
  let fixture: ComponentFixture<EmailListFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailListFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailListFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

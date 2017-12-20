import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRecipientsDialogComponent } from './add-recipients-dialog.component';

describe('AddRecipientsDialogComponent', () => {
  let component: AddRecipientsDialogComponent;
  let fixture: ComponentFixture<AddRecipientsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddRecipientsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRecipientsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

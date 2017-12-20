import { Component, Inject, OnInit, Input } from '@angular/core';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material';
import {FormGroup, FormBuilder} from '@angular/forms';

import {EmailUtilityService} from '../email-utility.service';

@Component({
  selector: 'add-recipients-dialog',
  templateUrl: './add-recipients-dialog.component.html',
  styleUrls: ['./add-recipients-dialog.component.css']
})
export class AddRecipientsDialogComponent implements OnInit {

  emailListForm : FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddRecipientsDialogComponent>,
    private fb: FormBuilder,
    private emailUtility : EmailUtilityService
  ) { }

  ngOnInit() {
    this.emailListForm = this.fb.group({emailList : ['']});
  }

  addRecipients(){
    this.dialogRef.close(this.emailUtility.parsePotentialEmails(this.emailListForm.get('emailList').value));
  }
}

import { Component, OnInit, Input} from '@angular/core';
import 'rxjs/Rx';
import {FormControl, FormGroup} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';

import { EMAIL_REGEX } from '../../../../shared/globals';


@Component({
  selector: 'email-list-field',
  templateUrl: './email-list-field.component.html',
  styleUrls: ['./email-list-field.component.css']
})
export class EmailListFieldComponent implements OnInit {

  @Input() parentFormGroup: FormGroup;
  @Input() emailListFormControl : FormControl;
  @Input() errorStateMatcher : ErrorStateMatcher;

  constructor() { }

  ngOnInit() {
    let vc = this.emailListFormControl.valueChanges;

    vc.subscribe(value =>{
      if (!value){
        this.emailListFormControl.setErrors({required:true});
      }
      else{
        this.emailListFormControl.setErrors({waiting: true});
      }
    });

    vc.debounceTime(1000)
      .distinctUntilChanged()
      .subscribe(value => {
        if (!value){
          this.emailListFormControl.setErrors({required:true});
          return;
        }
        let emails : string[] = this.getEmails();
        let invalidEmails = emails.filter(function(email){
          return !email.match(EMAIL_REGEX);
        });
        this.emailListFormControl.setErrors(
          invalidEmails.length ?
            {invalidEmails : [invalidEmails]}
          // : emails.length <= 1 ?
          //   {tooFew : true}
          : null
        );
      });
  }
  getEmails() : string[] {
    return this.emailListFormControl.value
      .split(/\r|\n|;|,/).filter(e => e).map(e => e.trim());
  }

  firstInvalidEmails() : string {
    let shown = 5;
    let emails : string[] = this.emailListFormControl.getError('invalidEmails');
    let joined = emails.slice(0,shown).join(', ');
    if (emails.length > shown){
      joined += '...';
    }
    return joined;
  }

}

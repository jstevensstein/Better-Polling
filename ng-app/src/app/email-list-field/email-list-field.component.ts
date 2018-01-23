import { Component, OnInit, Input} from '@angular/core';
import 'rxjs/Rx';
import {FormControl, FormGroup} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';

import {GenericErrorStateMatcher} from '../generic-error-state-matcher';
import {EmailUtilityService} from '../email-utility.service';


@Component({
  selector: 'email-list-field',
  templateUrl: './email-list-field.component.html',
  styleUrls: ['./email-list-field.component.css']
})
export class EmailListFieldComponent implements OnInit {

  @Input() parentFormGroup: FormGroup;
  @Input() emailListFormControl : FormControl;
  @Input() errorStateMatcher : ErrorStateMatcher;
  @Input() newPoll : boolean = true;

  constructor(private emailUtility : EmailUtilityService) { }

  ngOnInit() {
    this.errorStateMatcher = this.errorStateMatcher || new GenericErrorStateMatcher();

    let vc = this.emailListFormControl.valueChanges;

    vc.subscribe(value =>{
      if(value){
        this.emailListFormControl.setErrors({waiting: true});
      }
      else{
        if (this.newPoll){
          this.emailListFormControl.setErrors({required:true});
        }
        else{
          this.emailListFormControl.setErrors(null);
        }
      }
    });

    vc.debounceTime(1000)
      .distinctUntilChanged()
      .subscribe(value => {
        if (this.newPoll && !value){
          this.emailListFormControl.setErrors({required:true});
          return;
        }
        let invalidEmails = this.emailUtility.parseInvalidEmails(value);
        this.emailListFormControl.setErrors(
          invalidEmails.length ?
            {invalidEmails : [invalidEmails]}
          // : emails.length <= 1 ?
          //   {tooFew : true}
          : null
        );
      });
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

import { Component, ViewChild, ElementRef, Directive, OnInit, QueryList, ViewChildren, Input } from '@angular/core';
import {MatInputModule, MatInput, MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {FormControl, FormGroup, FormGroupDirective, NgForm, Validators, ValidatorFn, AbstractControl, FormBuilder} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';

export class GenericErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

var emailListValidator : ValidatorFn;

emailListValidator =  function(control: AbstractControl) {
  let invalidEmails : string[] = (control.value as string)
  .split(/\r|\n|;|,/)
  .filter(function(email){
    return email && !email.trim().match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  });
  return invalidEmails.length ? {'invalidEmails' : {emails: invalidEmails}} : null;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  pollForm: FormGroup;
  emailListMatcher = new GenericErrorStateMatcher();
  ownerEmailMatcher = new GenericErrorStateMatcher();
  titleMatcher = this.ownerEmailMatcher;

  constructor(private fb: FormBuilder){
    this.createForm();
  }

  createForm(){
    this.pollForm = new FormGroup({
      title : new FormControl('', Validators.required),
      ownerEmail : new FormControl('', [Validators.required, Validators.email]),
      emailList : new FormControl('', {
        validators: [Validators.required, emailListValidator],
        updateOn: 'blur'
      })
    });
  }

  pollOptions: {value: string}[] = [{value:'Option 1'}, {value: 'Option 2'}];

  firstInvalidEmails = function(){
    let shown = 5;
    let emails : string[] = this.emailListFormControl.getError('invalidEmails').emails;
    let joined = emails.slice(0,shown).join(', ');
    if (emails.length > shown){
      joined += '...';
    }
    return joined;
  }
}

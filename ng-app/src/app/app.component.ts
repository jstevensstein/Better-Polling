import { Component, ViewChild, ElementRef, Directive, OnInit, QueryList, ViewChildren, Input } from '@angular/core';
import {MatInputModule, MatInput, MatIconRegistry, MatStepperModule, MatProgressSpinner} from '@angular/material';
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
export class AppComponent implements OnInit{

  pollForm: FormGroup;
  emailListMatcher = new GenericErrorStateMatcher();
  ownerEmailMatcher = new GenericErrorStateMatcher();
  titleMatcher = this.ownerEmailMatcher;

  showSpinner: bool = false;

  constructor(private fb: FormBuilder){}

  ngOnInit(){
    this.createForm();
  }

  createForm(){
    this.pollForm = new FormGroup({
      title : new FormControl('', Validators.required),
      ownerEmail : new FormControl('', [Validators.required, Validators.email]),
      emailList : new FormControl('', {
        validators: [Validators.required, emailListValidator],
        updateOn: 'blur'
      }),
      pollOptions: this.fb.array([
        new FormControl('Option 1'),
        new FormControl('Option 2')
      ]);
    });
  }

  firstInvalidEmails = function(){
    let shown = 5;
    let emails : string[] = this.pollForm.get('emailList').getError('invalidEmails').emails;
    let joined = emails.slice(0,shown).join(', ');
    if (emails.length > shown){
      joined += '...';
    }
    return joined;
  }

  tryCreatePoll(){
    this.showSpinner = true;
  }
}

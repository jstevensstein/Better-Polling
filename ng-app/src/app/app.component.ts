import { Component, ViewChild, ElementRef, Directive, OnInit, QueryList, ViewChildren, Input } from '@angular/core';
import {MatInputModule, MatInput, MatIconRegistry, MatStepperModule, MatProgressSpinner, MatStepper, MatDialog} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {FormControl, FormGroup, FormGroupDirective, NgForm, Validators, ValidatorFn, AbstractControl, FormBuilder} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {PollService} from './poll.service';
import {Poll} from './poll';
import {ErrorDialogComponent} from './error-dialog.component';
import { catchError, map, tap } from 'rxjs/operators';

export class GenericErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

var emailListValidator : ValidatorFn = function(control: AbstractControl) {
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
  @ViewChild('stepper') stepper: MatStepper;

  showSpinner: boolean = false;
  pollCreated: boolean = false;

  constructor(private fb: FormBuilder, private pollService : PollService, public errorDialog: MatDialog){

  }

  ngOnInit(){
    this.createForm();
  }

  createForm(){
    this.pollForm = this.fb.group({
      title : new FormControl('', Validators.required),
      ownerEmail : new FormControl('', [Validators.required, Validators.email]),
      emailList : new FormControl('', {
        validators: [Validators.required, emailListValidator],
        updateOn: 'blur'
      }),
      pollOptions: this.fb.array([
        new FormControl('Option 1'),
        new FormControl('Option 2')
      ])
    });
  }

  getEmails = function() : string[] {
    return this.pollForm.get('emailList').value
      .split(/\r|\n|;|,/).map(e => e.trim());
  }

  firstInvalidEmails = function() : string {
    let shown = 5;
    let emails : string[] = this.pollForm.get('emailList').getError('invalidEmails').emails;
    let joined = emails.slice(0,shown).join(', ');
    if (emails.length > shown){
      joined += '...';
    }
    return joined;
  }

  openErrorDialog(){
    this.errorDialog.open(ErrorDialogComponent, {
      height: '250px';
    });
  }

  tryCreatePoll = function() : void {
    this.showSpinner = true;
    let pre = this.pollForm.value;
    let poll = new Poll(pre.title, pre.pollOptions,
      this.getEmails(), pre.ownerEmail);
    let res = this.pollService.upsertPoll(poll).subscribe((res) => {
      this.showSpinner = false;
      if (!res || res.error){
        this.openErrorDialog();
      }
      else{
        this.pollCreated = true;
        this.stepper.next();
      }
    });
  }
}

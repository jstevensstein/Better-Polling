import { Component, ViewChild, ElementRef, Directive, OnInit, QueryList, ViewChildren, Input } from '@angular/core';
import {MatInputModule, MatInput, MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {FormControl, FormGroupDirective, NgForm, Validators, ValidatorFn, AbstractControl} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';


export class EmailListErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

var emailListValidator : ValidatorFn;
emailListValidator =  function(control: AbstractControl) {
  let emails : string[] = (control.value as string).split(/,|\n|;/);
  let invalidEmails = emails;
  return invalidEmails ? {'invalidEmails' : {emails: invalidEmails}} : null;
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  pollOptions: {value: string}[] = [{value:'Option 1'}, {value: 'Option 2'}];

  emailListFormControl = new FormControl('', [
    Validators.required,
    emailListValidator
  ]);

  matcher = new EmailListErrorStateMatcher();

}

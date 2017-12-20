import { Component, ViewChild, ElementRef, Directive, OnInit, QueryList, ViewChildren, Input } from '@angular/core';
import {MatInputModule, MatInput, MatIconRegistry, MatStepperModule, MatProgressSpinner, MatStepper, MatDialog} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {FormControl, FormGroup, FormGroupDirective, NgForm, Validators, ValidationErrors, AsyncValidatorFn, AbstractControl, FormBuilder} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import 'rxjs/Rx';
import {PollService} from '../poll.service';
import {Poll} from '../poll';
import { NotifyDialogComponent } from '../notify-dialog.component';
import { LoadingComponent } from '../loading/loading.component';
import { catchError, map, tap } from 'rxjs/operators';
import { EMAIL_REGEX } from '../../../../shared/globals';

export class GenericErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

@Component({
  selector: 'app-build-poll',
  templateUrl: './build-poll.component.html',
  styleUrls: ['./build-poll.component.css']
})
export class BuildPollComponent implements OnInit {
  pollForm: FormGroup;
  errorStateMatcher = new GenericErrorStateMatcher();
  @ViewChild('stepper') stepper: MatStepper;

  showSpinner: boolean = false;
  pollCreated: boolean = false;

  constructor(
    private fb: FormBuilder,
    private pollService : PollService,
    public notifyDialog: MatDialog
  ){}

  ngOnInit(){
    this.createForm();
  }

  createForm(){
    this.pollForm = this.fb.group({
      title : ['', Validators.required],
      ownerEmail: ['', [Validators.required, Validators.email]],
      emailList : [
        ''
      ],
      pollOptions: this.fb.array([
        new FormControl('Option 1'),
        new FormControl('Option 2')
      ])
    });
  }

  getEmails = function() : string[] {
    return this.pollForm.get('emailList').value
      .split(/\r|\n|;|,/).filter(e => e).map(e => e.trim());
  }
  //TODO: consolidate with email-list-field-component.ts def

  tryCreatePoll = function() : void {
    this.showSpinner = true;
    let pre = this.pollForm.value;
    let poll = new Poll(pre.title, pre.pollOptions, this.getEmails(), pre.ownerEmail);
    let res = this.pollService.upsertPoll(poll).subscribe((res) => {
      this.showSpinner = false;
      if (!res || res.error){
        let message = res ? res.error : "An unexpected error occured."
        this.notifyDialog.open(NotifyDialogComponent, {
          data: {
            title: 'Uh Oh',
            message: message,
            closeName: 'Close'
          }
        });
      }
      else {
        this.pollCreated = true;
        this.stepper.next();
      }
    });
  }
}

import { Component, ViewChild, ElementRef, Directive, OnInit, QueryList, ViewChildren, Input } from '@angular/core';
import {MatInputModule, MatInput, MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {FormArray, FormBuilder, FormControl} from '@angular/forms';

@Component({
  selector: 'build-options',
  templateUrl: './build-options.component.html',
  styleUrls: ['./build-options.component.css']
})
export class BuildOptionsComponent {

  @Input() parentFormGroup: FormGroup;

  pollOptions : FormArray;

  constructor(private fb: FormBuilder, iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'delete',
      sanitizer.bypassSecurityTrustResourceUrl('/assets/ic_delete_24px.svg')
    );
    this.pollOptions = this.fb.array([
      new FormControl('Option 1'),
      new FormControl('Option 2')
    ]);
  }

  @ViewChildren('pollOptionsElts') pollOptionsElts: QueryList<MatInput>;

  //@Input() pollOptions: string[];

  addOptionAtEnd = function(){
    this.addOption(this.pollOptions.length);
  }

  addOption = function(i: number){
    this.pollOptions.insert(i, new FormControl(`Option ${this.pollOptions.length + 1}`));
    setTimeout(() => {
      this.pollOptionsElts._results[i].nativeElement.select();
    });
  }

  onEnter = function(i : number){
    this.addOption(i+1);
  }

  onDelete = function(i : number){
    if (!this.pollOptions[i].value){
      this.tryRemoveOption(i);
    }
  }

  tryRemoveOption = function(i : number){
    if (this.pollOptions.length > 2){
      this.removeOption(i);
      return true;
    }
    else{
      return false;
    }
  }

  removeOption = function(i : number){
    this.pollOptions.removeAt(i);
    setTimeout(() => {
      this.pollOptionsElts._results[Math.max(i-1,0)].nativeElement.select();
    });
  }

  onBlurOption = function(i : number){
    this.pollOptions[i].setValue(this.pollOptions[i].value || `Option ${i + 1}`);
  }
}

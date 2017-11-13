import { Component, ViewChild, ElementRef, Directive, OnInit, QueryList, ViewChildren, Input } from '@angular/core';
import {MatInputModule, MatInput, MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
        'delete',
        sanitizer.bypassSecurityTrustResourceUrl('/assets/ic_delete_24px.svg')
      );
  }

  @ViewChild('foobuz') foobuz: MatInput;
  @ViewChildren('foobar') foobar: QueryList<MatInput>;

  pollOptions: string[] = [{value:'Option 1'}, {value: 'Option 2'}];

  addOptionAtEnd = function(){
    this.addOption(this.pollOptions.length);
  }

  addOption = function(i: number){
    this.pollOptions.splice(i, 0, {value: `Option ${this.pollOptions.length + 1}`});
    setTimeout(() =>
      this.foobar._results[i].nativeElement.select();
    );
  }

  onEnter = function(i : number){
    this.addOption(i+1);
  }

  onDelete = function(i : number){
    if (!this.pollOptions[i].value){
      this.removeOption(i);
    }
  }

  removeOption = function(i : number){
    this.pollOptions.splice(i, 1);
    setTimeout(() =>
      this.foobar._results[i-1].nativeElement.select();
    );
  }

  onBlurOption = function(i : number){
    this.pollOptions[i].value = this.pollOptions[i].value || `Option ${i + 1}`;
  }
}

import { Component, ViewChild, ElementRef, Directive, OnInit, QueryList, ViewChildren, Input } from '@angular/core';
import {MatInputModule, MatInput, MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'build-options',
  templateUrl: './build-options.component.html',
  styleUrls: ['./build-options.component.css']
})
export class BuildOptionsComponent {

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
        'delete',
        sanitizer.bypassSecurityTrustResourceUrl('/assets/ic_delete_24px.svg')
      );
  }

  @ViewChildren('pollOptionsElts') pollOptionsElts: QueryList<MatInput>;

  @Input() pollOptions: string[];

  addOptionAtEnd = function(){
    this.addOption(this.pollOptions.length);
  }

  addOption = function(i: number){
    this.pollOptions.splice(i, 0, {value: `Option ${this.pollOptions.length + 1}`});
    setTimeout(function(){
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
    this.pollOptions.splice(i, 1);
    setTimeout(function(){
      this.pollOptionsElts._results[Math.max(i-1,0)].nativeElement.select();
    });
  }

  onBlurOption = function(i : number){
    this.pollOptions[i].value = this.pollOptions[i].value || `Option ${i + 1}`;
  }
}

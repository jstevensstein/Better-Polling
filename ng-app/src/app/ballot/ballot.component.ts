import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MatListModule, MatDialog } from '@angular/material';
import {NotifyDialogComponent } from '../notify-dialog.component';

import { PollService } from '../poll.service';
import { Ballot } from '../ballot';

@Component({
  selector: 'app-ballot',
  templateUrl: './ballot.component.html',
  styleUrls: ['./ballot.component.css'],
})
export class BallotComponent implements OnInit {

  ballot : Ballot;
  showSpinner : boolean = true;
  static successMessage : string = `
    You have submitted your ballot in this poll. You may re-order your choices
    and re-submit at any time before the poll has closed.
  `;

  constructor(
    private route: ActivatedRoute,
    private pollService: PollService,
    private location: Location,
    public notifyDialog: MatDialog
  ) {}

  ngOnInit() {
    this.getBallot();
  }

  getToken(){
    //refactor to get once if possible;
    return this.route.snapshot.queryParamMap.get('token');
  }

  getBallot(){
    let id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.pollService.getBallot(id, this.getToken()).subscribe(res => {
      this.ballot = res.ballot as Ballot;
      this.showSpinner = false;
    });
  }

  openNotifyDialog(title: string, message: string, closeName : string){
    this.notifyDialog.open(NotifyDialogComponent, {
      data: {
        title: title,
        message: message,
        closeName: closeName
      }
    });
  }

  submitBallot(){
    this.showSpinner = true;
    let order : number[] = this.ballot.options.map(o => o.id);
    let res = this.pollService.upsertBallotChoices(this.ballot.id,
      order, this.getToken())
    .subscribe((res) => {
      this.showSpinner = false;
      if (!res || res.error){
        this.openNotifyDialog('Uh Oh!', res.error.message, 'Close');
      }
      else {
        this.openNotifyDialog('Success!', BallotComponent.successMessage, 'OK');
      }
    });
  }
}

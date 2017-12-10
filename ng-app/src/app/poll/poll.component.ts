import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material';
import { NotifyDialogComponent } from '../notify-dialog.component';

import { PollService } from '../poll.service';
import { Poll } from '../poll';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.css']
})
export class PollComponent implements OnInit {
  poll : Poll;
  showSpinner : boolean = true;

  constructor(
    private route: ActivatedRoute,
    private pollService: PollService,
    private location: Location,
    public notifyDialog: MatDialog
  ) {}

  ngOnInit() {
      this.getPoll();
  }

  getToken(){
    return this.route.snapshot.queryParamMap.get('token');
  }

  getPoll(){
    let id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.pollService.getPoll(id, this.getToken()).subscribe(res => {
      this.poll = res.poll as Poll;
      this.showSpinner = false;
    });
  }

  closePoll = function() : void {
    this.showSpinner = true;
    let res = this.pollService.closePoll(this.poll.id, this.getToken()).subscribe((res) => {
      this.showSpinner = false;
      if (!res || res.error){
        this.notifyDialog.open(NotifyDialogComponent, {
          data: {
            title: 'Uh Oh',
            message: res.error.message,
            closeName: 'Close'
          }
        });
      }
      else {
        this.poll.closed = true;
        this.notifyDialog.open(NotifyDialogComponent, {
          data: {
            title: 'Success',
            message: `${res.winner} is the winner of your poll. We are emailing
              the results to all of the ballot recipients.`,
            closeName: 'OK'
          }
        });
      }
    });
  }

}

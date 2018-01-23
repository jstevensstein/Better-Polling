import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material';
import { NotifyDialogComponent } from '../notify-dialog.component';
import { AddRecipientsDialogComponent } from '../add-recipients-dialog/add-recipients-dialog.component';

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
    public notifyDialog: MatDialog,
    public addRecipientsDialog : MatDialog
  ) {}

  ngOnInit() {
      this.getPoll();
  }

  hasWinner() : boolean {
    return this.poll.winnerId && this.poll.winnerId > -1;
  }

  getWinner() : string {
    return this.poll.getWinner();
  }

  cannotClosePoll() : boolean {
    return this.poll.closed || !this.poll.ballots.some(b => b.complete);
  }

  getToken(){
    return this.route.snapshot.queryParamMap.get('token');
  }

  getPoll(){
    let id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.pollService.getPoll(id, this.getToken()).subscribe(res => {
      this.poll = new Poll(
        res.poll.name, res.poll.options, res.poll.id,
        res.poll.closed, res.poll.ballots, res.poll.winnerId
      );
      this.poll.ballots.sort(function(a,b){
        return (a.email > b.email) ? 1 : ((b.email > a.email) ? -1 : 0);
      });
      this.showSpinner = false;
    });
  }

  openAddRecipientsDialog() : void {
    this.addRecipientsDialog.open(AddRecipientsDialogComponent, {})
    .afterClosed().subscribe(emails => {
      if (emails){
        let newEmails = emails.filter(email => !this.poll.ballots.some(b => b.email === email));
        if (newEmails.length){
          this.addRecipients(emails);
        }
        else{
          this.notifyDialog.open(NotifyDialogComponent, {
            data: {
              title: 'Duplicate Emails',
              message: 'There are no new recipient emails.',
              closeName: 'Close'
            }
          });
        }
      }
    });
  }

  addRecipients(emails: string[]) : void {
    this.showSpinner = true;
    let res = this.pollService.addRecipients(this.poll.id, this.getToken(), emails)
    .subscribe((res) => {
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
        this.notifyDialog.open(NotifyDialogComponent, {
          data: {
            title: 'Success',
            message: 'You have successfully added more ballot recipients!',
            closeName: 'OK'
          }
        });
        emails.forEach(email => {
          this.poll.ballots.push({email: email, complete: false});
        })
      }
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
        this.poll.winnerId = res.winnerId;
        this.notifyDialog.open(NotifyDialogComponent, {
          data: {
            title: 'Success',
            message: `${this.getWinner()} is the winner of your poll. We are emailing
              the results to all of the ballot recipients.`,
            closeName: 'OK'
          }
        });
      }
    });
  }

}

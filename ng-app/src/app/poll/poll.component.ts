import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material';


import { PollService } from '../poll.service';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.css']
})
export class PollComponent implements OnInit {
  //poll : Poll;
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
    // let id = parseInt(this.route.snapshot.paramMap.get('id'));
    // this.pollService.gePoll(id, this.getToken()).subscribe(res => {
    //   this.ballot = res.ballot as Ballot;
    //   this.showSpinner = false;
    // });
  }

}

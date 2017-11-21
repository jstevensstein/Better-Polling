import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MatListModule } from '@angular/material';

import { PollService } from '../poll.service';
import { Ballot } from '../ballot';

@Component({
  selector: 'app-ballot',
  templateUrl: './ballot.component.html',
  styleUrls: ['./ballot.component.css'],
})
export class BallotComponent implements OnInit {

  ballot : Ballot;

  constructor(
    private route: ActivatedRoute,
    private pollService: PollService,
    private location: Location
  ) {}

  ngOnInit() {
    this.getBallot();
  }

  getBallot(){
    let id = parseInt(this.route.snapshot.paramMap.get('id'));
    let token = this.route.snapshot.queryParamMap.get('token');
    this.pollService.getBallot(id, token).subscribe(res => {
      this.ballot = res.ballot as Ballot;
    });
  }
}

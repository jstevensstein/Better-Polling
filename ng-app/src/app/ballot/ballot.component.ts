import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { PollService } from '../poll.service'

@Component({
  selector: 'app-ballot',
  templateUrl: './ballot.component.html',
  styleUrls: ['./ballot.component.css'],
})
export class BallotComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private pollService: PollService,
    private location: Location
  ) {}

  ngOnInit() {
  }

}

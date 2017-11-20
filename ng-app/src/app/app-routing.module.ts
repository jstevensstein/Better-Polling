import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuildPollComponent } from './build-poll/build-poll.component';
import { IndexComponent } from './index/index.component';
import { BallotComponent } from './ballot/ballot.component';

const routes: Routes = [
  { path: 'buildPoll', component: BuildPollComponent },
  { path: '', component: IndexComponent },
  { path: 'ballot/:id', component: BallotComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }

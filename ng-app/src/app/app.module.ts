import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule, MatButtonModule, MatCardModule, MatToolbarModule,
  MatIconModule, MatIconRegistry, MatStepperModule, MatProgressSpinnerModule,
  MatDialogModule, MatListModule} from '@angular/material';
import { HttpClientModule } from '@angular/common/http';

import { SortablejsModule } from 'angular-sortablejs';

import { AppComponent } from './app.component';
import { BuildOptionsComponent } from './build-options/build-options.component';
import { NotifyDialogComponent } from './notify-dialog.component';
import { PollService } from './poll.service';
import { EmailUtilityService } from './email-utility.service';
import { AppRoutingModule } from './/app-routing.module';
import { BuildPollComponent } from './build-poll/build-poll.component';
import { IndexComponent } from './index/index.component';
import { BallotComponent } from './ballot/ballot.component';
import { LoadingComponent} from './loading/loading.component';

import { environment } from '../environments/environment';
import { PollComponent } from './poll/poll.component';
import { EmailListFieldComponent } from './email-list-field/email-list-field.component';
import { AddRecipientsDialogComponent } from './add-recipients-dialog/add-recipients-dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    BuildOptionsComponent,
    NotifyDialogComponent,
    BuildPollComponent,
    IndexComponent,
    BallotComponent,
    LoadingComponent,
    PollComponent,
    EmailListFieldComponent,
    AddRecipientsDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    HttpClientModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    AppRoutingModule,
    MatToolbarModule,
    MatListModule,
    SortablejsModule.forRoot({ animation: 150 })
  ],
  providers: [
    MatIconRegistry,
    PollService,
    EmailUtilityService
  ],
  entryComponents:[
    NotifyDialogComponent,
    AddRecipientsDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // <-- NgModel lives here
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule, MatButtonModule, MatCardModule, MatToolbarModule, MatIconModule, MatIconRegistry, MatStepperModule, MatProgressSpinnerModule, MatDialogModule, MatListModule} from '@angular/material';
import { HttpClientModule } from '@angular/common/http';

import { SortablejsModule } from 'angular-sortablejs';

import { AppComponent } from './app.component';
import { BuildOptionsComponent } from './build-options.component';
import { ErrorDialogComponent } from './error-dialog.component';
import { PollService } from './poll.service';
import { AppRoutingModule } from './/app-routing.module';
import { BuildPollComponent } from './build-poll/build-poll.component';
import { IndexComponent } from './index/index.component';
import { BallotComponent } from './ballot/ballot.component';
import { LoadingComponent} from './loading/loading.component';


@NgModule({
  declarations: [
    AppComponent,
    BuildOptionsComponent,
    ErrorDialogComponent,
    BuildPollComponent,
    IndexComponent,
    BallotComponent,
    LoadingComponent
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
    PollService
  ],
  entryComponents:[
    ErrorDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

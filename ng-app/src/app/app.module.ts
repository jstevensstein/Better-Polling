import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // <-- NgModel lives here
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatInputModule, MatButtonModule, MatCardModule, MatToolbarModule, MatIconModule, MatIconRegistry, MatStepperModule} from '@angular/material';
import {HttpClientModule} from '@angular/common/http';
import { AppComponent } from './app.component';
import { BuildOptionsComponent } from './build-options.component';


@NgModule({
  declarations: [
    AppComponent,
    BuildOptionsComponent
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
    MatStepperModule
  ],
  providers: [
    MatIconRegistry
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

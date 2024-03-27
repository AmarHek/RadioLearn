import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FeedbackDisplayComponent} from "@app/feedback/feedback-display/feedback-display.component";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {MatButtonModule} from "@angular/material/button";



@NgModule({
  declarations: [
    FeedbackDisplayComponent
  ],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    RouterModule,
    MatButtonModule
  ],
  exports: [
    FeedbackDisplayComponent
  ]
})
export class FeedbackModule { }

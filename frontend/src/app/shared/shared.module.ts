import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatDialogModule} from "@angular/material/dialog";
import {MatDividerModule} from "@angular/material/divider";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatRadioModule} from "@angular/material/radio";
import {MatSelectModule} from "@angular/material/select";
import {MatTooltipModule} from "@angular/material/tooltip";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";

import {ConfirmDialogComponent} from "@app/shared/confirm-dialog/confirm-dialog.component";
import {InputModalComponent} from "@app/shared/inputModal/inputModal.component";

import {FeedbackDialogComponent} from "./feedback-dialog/feedback-dialog.component";

import {InputDialogComponent} from "./input-dialog/input-dialog.component";

import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';


@NgModule({
  declarations: [
    ConfirmDialogComponent,
    FeedbackDialogComponent,
    InputDialogComponent,
    InputModalComponent,
    SettingsDialogComponent
  ],
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatDialogModule,
        MatDividerModule,
        MatIconModule,
        MatInputModule,
        MatProgressBarModule,
        MatRadioModule,
        MatSelectModule,
        MatTooltipModule,
        NgbModule,
        ReactiveFormsModule,
        MatSlideToggleModule
    ],
    exports: [
        ConfirmDialogComponent,
        FeedbackDialogComponent,
        InputDialogComponent,
        InputModalComponent,
    ]
})
export class SharedModule { }

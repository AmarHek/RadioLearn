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
import {UploadMaterialComponent} from "@app/shared/upload-material/upload-material.component";
import {VariablesComponent} from "@app/shared/variables/variables.component";

import {ImageDisplayStudentComponent} from "./image-display-student/image-display-student.component";
import {ImageDisplayComponent} from "./image-display/image-display.component";
import {RadiolearnOptionsComponent} from "./radiolearn-options/radiolearn-options.component";

import {ChangePasswordComponent} from "./change-password/change-password.component";
import {ChangeUsernameComponent} from "./change-username/change-username.component";
import {FeedbackDialogComponent} from "./feedback-dialog/feedback-dialog.component";

import {InputDialogComponent} from "./input-dialog/input-dialog.component";
import {StudentErrorsComponent} from "./student-errors/student-errors.component";

import {SignUpComponent} from "./sign-up/sign-up.component";
import {AddScanDialogComponent} from "./add-scan-dialog/add-scan-dialog.component";
import { ChangeRoleDialogComponent } from './change-role-dialog/change-role-dialog.component';
import { RadiolearnOptionsShallowComponent } from './radiolearn-options-shallow/radiolearn-options-shallow.component';
import { AnnotationPopupComponent } from './annotation-popup/annotation-popup.component';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';


@NgModule({
  declarations: [
    ChangePasswordComponent,
    ChangeUsernameComponent,
    ConfirmDialogComponent,
    FeedbackDialogComponent,
    ImageDisplayComponent,
    ImageDisplayStudentComponent,
    InputDialogComponent,
    InputModalComponent,
    StudentErrorsComponent,
    RadiolearnOptionsComponent,
    SignUpComponent,
    UploadMaterialComponent,
    VariablesComponent,
    AddScanDialogComponent,
    ChangeRoleDialogComponent,
    RadiolearnOptionsShallowComponent,
    AnnotationPopupComponent,
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
        ChangePasswordComponent,
        ChangeUsernameComponent,
        ConfirmDialogComponent,
        FeedbackDialogComponent,
        ImageDisplayComponent,
        ImageDisplayStudentComponent,
        InputDialogComponent,
        InputModalComponent,
        StudentErrorsComponent,
        RadiolearnOptionsComponent,
        SignUpComponent,
        UploadMaterialComponent,
        VariablesComponent,
        RadiolearnOptionsShallowComponent
    ]
})
export class SharedModule { }

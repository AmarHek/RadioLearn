import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatLegacyButtonModule as MatButtonModule} from "@angular/material/legacy-button";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatLegacyCheckboxModule as MatCheckboxModule} from "@angular/material/legacy-checkbox";
import {MatLegacyDialogModule as MatDialogModule} from "@angular/material/legacy-dialog";
import {MatDividerModule} from "@angular/material/divider";
import {MatIconModule} from "@angular/material/icon";
import {MatLegacyInputModule as MatInputModule} from "@angular/material/legacy-input";
import {MatLegacyProgressBarModule as MatProgressBarModule} from "@angular/material/legacy-progress-bar";
import {MatLegacyRadioModule as MatRadioModule} from "@angular/material/legacy-radio";
import {MatLegacySelectModule as MatSelectModule} from "@angular/material/legacy-select";
import {MatLegacyTooltipModule as MatTooltipModule} from "@angular/material/legacy-tooltip";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {MatLegacySlideToggleModule as MatSlideToggleModule} from "@angular/material/legacy-slide-toggle";

import {ConfirmDialogComponent} from "@app/shared/confirm-dialog/confirm-dialog.component";
import {InputModalComponent} from "@app/shared/inputModal/inputModal.component";
import {ReportOutputComponent} from "@app/shared/report-output/report-output.component";
import {UploadMaterialComponent} from "@app/shared/upload-material/upload-material.component";
import {UploadTemplateComponent} from "@app/shared/upload-template/upload-template.component";
import {VariablesComponent} from "@app/shared/variables/variables.component";

import {ImageDisplayStudentComponent} from "./image-display-student/image-display-student.component";
import {ImageDisplayComponent} from "./image-display/image-display.component";
import {RadiolearnOptionsComponent} from "./radiolearn-options/radiolearn-options.component";

import {ChangePasswordComponent} from "./change-password/change-password.component";
import {ChangeUsernameComponent} from "./change-username/change-username.component";
import {FeedbackDialogComponent} from "./feedback-dialog/feedback-dialog.component";
import {ReportOptionsComponent} from "@app/shared/report-options/report-options.component";

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
    ReportOutputComponent,
    ReportOptionsComponent,
    SignUpComponent,
    UploadTemplateComponent,
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
        ReportOptionsComponent,
        ReportOutputComponent,
        SignUpComponent,
        UploadTemplateComponent,
        UploadMaterialComponent,
        VariablesComponent,
        RadiolearnOptionsShallowComponent
    ]
})
export class SharedModule { }

import {NgModule} from "@angular/core";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatLegacyButtonModule as MatButtonModule} from "@angular/material/legacy-button";
import {MatLegacyCheckboxModule as MatCheckboxModule} from "@angular/material/legacy-checkbox";
import {MatLegacyChipsModule as MatChipsModule} from "@angular/material/legacy-chips";
import {MatLegacyDialogModule as MatDialogModule} from "@angular/material/legacy-dialog";
import {MatIconModule} from "@angular/material/icon";
import {MatLegacyListModule as MatListModule} from "@angular/material/legacy-list";
import {MatLegacyMenuModule as MatMenuModule} from "@angular/material/legacy-menu";
import {MatLegacySelectModule as MatSelectModule} from "@angular/material/legacy-select";
import {MatLegacySlideToggleModule as MatSlideToggleModule} from "@angular/material/legacy-slide-toggle";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatLegacyTooltipModule as MatTooltipModule} from "@angular/material/legacy-tooltip";
import {RouterModule} from "@angular/router";
import {MatLegacyRadioModule as MatRadioModule} from "@angular/material/legacy-radio";

import {AdminComponent} from "@app/feature/admin/admin.component";
import {FeedbackDisplayComponent} from "@app/feature/feedback-display/feedback-display.component";
import {TemplateListComponent} from "@app/feature/template-list/template-list.component";
import {RadiolearnListComponent} from "@app/feature/radiolearn-list/radiolearn-list.component";
import {RadiolearnUiComponent} from "@app/feature/radiolearn-ui/radiolearn-ui.component";
import {ReportUiComponent} from "@app/feature/report-ui/report-ui.component";
import {AccountManagementComponent} from "./account-management/account-management.component";
import {SharedModule} from "@app/shared/shared.module";
import { DialogTemplateComponent } from './dialog-template/dialog-template.component';
import {MatSidenavModule} from "@angular/material/sidenav";
import { DialogNoMaterialsComponent } from './dialog-no-materials/dialog-no-materials.component';
import { InputMaterialHandlerComponent } from './input-material-handler/input-material-handler.component';


@NgModule({
  declarations: [
    AccountManagementComponent,
    AdminComponent,
    FeedbackDisplayComponent,
    TemplateListComponent,
    RadiolearnListComponent,
    RadiolearnUiComponent,
    ReportUiComponent,
    DialogTemplateComponent,
    DialogNoMaterialsComponent,
    InputMaterialHandlerComponent
  ],
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatChipsModule,
        MatIconModule,
        MatListModule,
        MatMenuModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatToolbarModule,
        NgbModule,
        ReactiveFormsModule,
        RouterModule,
        SharedModule,
        MatTooltipModule,
        MatDialogModule,
        MatRadioModule,
        MatSidenavModule,
    ],
  exports: [
    AccountManagementComponent,
    AdminComponent,
    FeedbackDisplayComponent,
    TemplateListComponent,
    RadiolearnListComponent,
    RadiolearnUiComponent,
    ReportUiComponent
  ]
})
export class FeatureModule { }

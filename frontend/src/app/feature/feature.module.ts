import {NgModule} from "@angular/core";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatChipsModule} from "@angular/material/chips";
import {MatDialogModule} from "@angular/material/dialog";
import {MatIconModule} from "@angular/material/icon";
import {MatListModule} from "@angular/material/list";
import {MatMenuModule} from "@angular/material/menu";
import {MatSelectModule} from "@angular/material/select";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTooltipModule} from "@angular/material/tooltip";
import {RouterModule} from "@angular/router";
import {MatRadioModule} from "@angular/material/radio";

import {FeedbackDisplayComponent} from "@app/feedback/feedback-display/feedback-display.component";
import {SharedModule} from "@app/shared/shared.module";
import {DialogTemplateComponent} from '@app/shared/dialog-template/dialog-template.component';
import {MatSidenavModule} from "@angular/material/sidenav";
import {DialogNoMaterialsComponent} from '@app/shared/dialog-no-materials/dialog-no-materials.component';


@NgModule({
  declarations: [
    FeedbackDisplayComponent,
    DialogTemplateComponent,
    DialogNoMaterialsComponent,
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
    FeedbackDisplayComponent,
  ]
})
export class FeatureModule { }

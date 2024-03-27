import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialListComponent,
  AddScanDialogComponent,
  UploadMaterialComponent } from "@app/material-manager";
import {MatDialogModule} from "@angular/material/dialog";
import {MatDividerModule} from "@angular/material/divider";
import {MatButtonModule} from "@angular/material/button";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {MatOptionModule} from "@angular/material/core";
import {MatInputModule} from "@angular/material/input";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";


@NgModule({
  declarations: [
    MaterialListComponent,
    AddScanDialogComponent,
    UploadMaterialComponent
  ],
  imports: [
    CommonModule,
    NgbModule,
    MatDialogModule,
    MatDividerModule,
    MatButtonModule,
    MatProgressBarModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatTooltipModule,
    MatSlideToggleModule,
    FormsModule
  ],
  exports: [
    MaterialListComponent
  ]
})
export class MaterialManagerModule { }

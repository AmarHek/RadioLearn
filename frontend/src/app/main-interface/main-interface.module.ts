import {ImageAnnotatorComponent,
  ImageDisplayStudentComponent,
  InputMaterialHandlerComponent,
  RadiolearnOptionsComponent,
  RadiolearnOptionsShallowComponent,
  RadiolearnUiComponent,
  StudentErrorsComponent,
  VariablesComponent} from "@app/main-interface/";

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule} from "@angular/material/toolbar";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatRadioModule} from "@angular/material/radio";
import {FormsModule} from "@angular/forms";
import {MatListModule} from "@angular/material/list";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatDialogModule} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {MatChipsModule} from "@angular/material/chips";


@NgModule({
  declarations: [
    ImageDisplayStudentComponent,
    ImageAnnotatorComponent,
    InputMaterialHandlerComponent,
    RadiolearnOptionsComponent,
    RadiolearnOptionsShallowComponent,
    RadiolearnUiComponent,
    StudentErrorsComponent,
    VariablesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatRadioModule,
    MatListModule,
    MatSidenavModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule
  ],
  exports: [
    RadiolearnUiComponent
  ]
})
export class MainInterfaceModule { }

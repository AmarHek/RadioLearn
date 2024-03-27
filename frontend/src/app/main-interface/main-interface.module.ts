import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatChipsModule} from "@angular/material/chips";
import {MatDialogModule} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatListModule} from "@angular/material/list";
import {MatMenuModule} from "@angular/material/menu";
import {MatRadioModule} from "@angular/material/radio";
import {MatSelectModule} from "@angular/material/select";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTooltipModule} from "@angular/material/tooltip";

import {ImageAnnotatorComponent,
  ImageDisplayComponent,
  InputHandlerComponent,
  OptionsComponent,
  OptionsShallowComponent,
  RadiolearnUiComponent,
  StudentErrorsComponent,
  VariablesComponent} from "@app/main-interface/";


@NgModule({
  declarations: [
    ImageAnnotatorComponent,
    ImageDisplayComponent,
    InputHandlerComponent,
    OptionsComponent,
    OptionsShallowComponent,
    RadiolearnUiComponent,
    StudentErrorsComponent,
    VariablesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatTooltipModule
  ],
  exports: [
    RadiolearnUiComponent
  ]
})
export class MainInterfaceModule { }

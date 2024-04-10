import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {MatDialogModule} from "@angular/material/dialog";
import {MatChipsModule} from "@angular/material/chips";
import {MatIconModule} from "@angular/material/icon";
import {FormsModule} from "@angular/forms";
import {MatSelectModule} from "@angular/material/select";
import {MatOptionModule} from "@angular/material/core";
import {MatCardModule} from "@angular/material/card";

import {
  DialogAddBoxComponent,
  DialogAddCategoryComponent,
  DialogAddGroupComponent, DialogAddVariableComponent,
  DialogListVariablesComponent, TemplateEditorComponent, EditorOptionsComponent
} from "@app/template-editor";
import {MatListModule} from "@angular/material/list";
import {MainInterfaceModule} from "@app/main-interface/main-interface.module";


@NgModule({
  declarations: [
    DialogAddBoxComponent,
    DialogAddCategoryComponent,
    DialogAddGroupComponent,
    DialogListVariablesComponent,
    DialogAddVariableComponent,
    TemplateEditorComponent,
    EditorOptionsComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatDialogModule,
    MatChipsModule,
    MatIconModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MatCardModule,
    MatListModule,
    MainInterfaceModule
  ],
  exports: [
    TemplateEditorComponent
  ]
})

export class TemplateEditorModule { }

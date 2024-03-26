import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MatButtonModule} from "@angular/material/button";
import {MatDialogModule} from "@angular/material/dialog";
import {MatDividerModule} from "@angular/material/divider";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {AdminComponent, ChangeRoleDialogComponent, SignUpComponent} from "@app/admin";

@NgModule({
  declarations: [
    AdminComponent,
    ChangeRoleDialogComponent,
    SignUpComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  exports: [
    AdminComponent
  ]
})
export class AdminModule { }

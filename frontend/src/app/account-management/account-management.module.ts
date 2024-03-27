import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule} from "@angular/forms";

import {AccountManagementComponent,
  ChangePasswordComponent,
  ChangeUsernameComponent} from "@app/account-management";

@NgModule({
  declarations: [
    AccountManagementComponent,
    ChangePasswordComponent,
    ChangeUsernameComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    AccountManagementComponent
  ]
})

export class AccountManagementModule { }

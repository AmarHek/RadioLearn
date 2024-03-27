import {AccountManagementComponent,
  ChangePasswordComponent,
  ChangeUsernameComponent} from "@app/account-management";

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule} from "@angular/forms";

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

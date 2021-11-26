import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { LoginComponent, AdminComponent } from "@app/view";
import {
  ListComponent,
  UiBaseComponent,
  ListMaterialComponent,
  JudgeMatComponent,
  AccountManagementComponent,
  RadiolearnComponent,
  RadiolearnViewComponent
} from "@app/feature";
import { AuthGuard } from "@app/helpers";
import { Role } from "@app/models";

const routes: Routes = [
  {
    path: "login",
    component: LoginComponent
  },
  {
    path: "list",
    component: ListComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.User, Role.ExternalUser, Role.Moderator, Role.Admin] }
  },
  {
    path: "main/:id",
    component: UiBaseComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.User, Role.ExternalUser, Role.Moderator, Role.Admin] }
  },
  {
    path: "listMat",
    component: ListMaterialComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Moderator, Role.Admin] }
  },
  {
    path: "mainMat/:id",
    component: JudgeMatComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Moderator, Role.Admin] }
  },
  {
    path: "radiolearn",
    component: RadiolearnComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.User, Role.ExternalUser, Role.Moderator, Role.Admin] }
  },
  {
    path: "radiolearn/:id",
    component: RadiolearnViewComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.User, Role.ExternalUser, Role.Moderator, Role.Admin] }
  },
  {
    path: "admin",
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin] }
  },
  {
    path: "manageAccount",
    component: AccountManagementComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin, Role.Moderator, Role.User]}
  },
  {path: "**", redirectTo: "/list"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }

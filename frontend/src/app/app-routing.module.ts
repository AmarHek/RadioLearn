import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {
  FeedbackDisplayComponent,
} from "@app/feature";
import { TemplateListComponent } from "@app/template-manager";
import {AdminComponent} from "@app/admin";
import {AccountManagementComponent} from "@app/account-management";
import {MainInterfaceComponent} from "@app/main-interface";
import {MaterialListComponent} from "@app/material-manager";
import {AuthGuard} from "app/core/helpers";
import {Role} from "app/core/models";

import {LoginComponent} from "@app/view";
import {WelcomePage} from "@app/view/welcome-page/welcome-page";

const routes: Routes = [
  {
    path: "login",
    component: LoginComponent
  },
  {
    path: "home",
    component: WelcomePage,
    canActivate: [AuthGuard],
    data: { roles: [Role.User, Role.ExternalUser, Role.Moderator, Role.Admin, Role.demoUser, Role.tester] }
  },
  {
    path: "template-list",
    component: TemplateListComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.User, Role.ExternalUser, Role.Moderator, Role.Admin, Role.demoUser, Role.tester] }
  },
  {
    path: "material-list",
    component: MaterialListComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Moderator, Role.Admin] }
  },
  {
    path: "main/:id",
    component: MainInterfaceComponent,
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
  {
    path: "feedback",
    component: FeedbackDisplayComponent,
    canActivate: [AuthGuard],
    data: { role: [Role.Admin, Role.Moderator]}
  },
  {path: "**", redirectTo: "/home"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }

import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {NgModule} from "@angular/core";

import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule} from "@angular/forms";
import {MatDialogModule} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";

import {DateAdapter, MAT_DATE_FORMATS} from "@angular/material/core";
import {APP_DATE_FORMATS, AppDateAdapter, ErrorInterceptor, JwtInterceptor} from "app/core/helpers";

import {AccountManagementModule} from "@app/account-management/account-management.module";
import {AdminModule} from "@app/admin/admin.module";
import {FeedbackModule} from "@app/feedback/feedback.module";
import {MainInterfaceModule} from "@app/main-interface/main-interface.module";
import {MaterialManagerModule} from "@app/material-manager/material-manager.module";
import {PendingChangesGuard} from "@app/core/guards/pending-changes.guard";
import {SharedModule} from "@app/shared/shared.module";
import {TemplateManagerModule} from "@app/template-manager/template-manager.module";
import {ViewModule} from "@app/view/view.module";

import {AppRoutingModule} from "./app-routing.module";
import {AppComponent} from "./app.component";

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AdminModule,
    AccountManagementModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FeedbackModule,
    FormsModule,
    HttpClientModule,
    MaterialManagerModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MainInterfaceModule,
    SharedModule,
    TemplateManagerModule,
    ViewModule
  ],
  providers: [PendingChangesGuard,
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {NgModule} from "@angular/core";

import {DateAdapter, MAT_DATE_FORMATS} from "@angular/material/core";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FeatureModule} from "@app/feature/feature.module";
import {APP_DATE_FORMATS, AppDateAdapter, ErrorInterceptor, JwtInterceptor} from "@app/helpers";
import {SharedModule} from "@app/shared/shared.module";
import {ViewModule} from "@app/view/view.module";
import {AppRoutingModule} from "./app-routing.module";
import {AppComponent} from "./app.component";
import {DialogOverviewExampleDialogComponent} from "@app/feature";
import {FormsModule} from "@angular/forms";
import {MatDialogModule} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {PendingChangesGuard} from "@app/guards/pending-changes.guard";

@NgModule({
  declarations: [
    DialogOverviewExampleDialogComponent,
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    FeatureModule,
    SharedModule,
    ViewModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule
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

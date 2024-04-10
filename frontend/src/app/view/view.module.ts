import {CommonModule, NgOptimizedImage} from "@angular/common";
import {NgModule} from "@angular/core";
import {ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatListModule} from "@angular/material/list";
import {MatToolbarModule} from "@angular/material/toolbar";
import {RouterModule} from "@angular/router";

import {HeaderComponent} from "@app/view/header/header.component";
import {LoginComponent} from "@app/view/login/login.component";
import {WelcomePage} from "@app/view/welcome-page/welcome-page";
import {MatMenuModule} from "@angular/material/menu";
import {MatTooltip} from "@angular/material/tooltip";


@NgModule({
  declarations: [
    HeaderComponent,
    LoginComponent,
    WelcomePage
  ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MatButtonModule,
        MatToolbarModule,
        MatListModule,
        MatIconModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatMenuModule,
        NgOptimizedImage,
        MatTooltip
    ],
  exports: [
    HeaderComponent,
    LoginComponent,
    WelcomePage
  ]
})
export class ViewModule { }

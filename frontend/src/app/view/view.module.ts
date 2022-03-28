import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatListModule} from "@angular/material/list";
import {MatToolbarModule} from "@angular/material/toolbar";
import {RouterModule} from "@angular/router";

import {HeaderComponent} from "@app/view/header/header.component";
import {LoginComponent} from "@app/view/login/login.component";
import {RadiolearnWelcomeComponent} from "@app/view/radiolearn-welcome/radiolearn-welcome.component";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";


@NgModule({
  declarations: [
    HeaderComponent,
    LoginComponent,
    RadiolearnWelcomeComponent
  ],
    imports: [
        CommonModule,
        FontAwesomeModule,
        ReactiveFormsModule,
        RouterModule,
        MatButtonModule,
        MatToolbarModule,
        MatListModule,
        MatIconModule
    ],
  exports: [
    HeaderComponent,
    LoginComponent,
    RadiolearnWelcomeComponent
  ]
})
export class ViewModule { }

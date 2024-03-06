import {CommonModule} from "@angular/common";
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
import {RadiolearnWelcomeComponent} from "@app/view/radiolearn-welcome/radiolearn-welcome.component";
import {MatMenuModule} from "@angular/material/menu";


@NgModule({
  declarations: [
    HeaderComponent,
    LoginComponent,
    RadiolearnWelcomeComponent
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
        MatMenuModule
    ],
  exports: [
    HeaderComponent,
    LoginComponent,
    RadiolearnWelcomeComponent
  ]
})
export class ViewModule { }

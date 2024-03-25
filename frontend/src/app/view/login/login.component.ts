import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { first } from "rxjs/operators";

import {AuthenticationService} from "@app/core/services/authentication.service";
import {Role} from "app/core/models";
import {environment} from "@env/environment";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {

  loginForm: UntypedFormGroup;
  loading = false;
  submitted = false;
  error = "";

  assetsUrl = environment.assets;

  constructor(private formBuilder: UntypedFormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private authenticationService: AuthenticationService
  ) {
    if (this.authenticationService.userValue) {
      this.router.navigate(["/"]).then();
    }
  }

  // convenience getter for easy access to form fields
  get fc() {
    return this.loginForm.controls;
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ["", Validators.required],
      password: ["", Validators.required]
    });
  }

  getUsernameError() {
    if (this.fc.username.hasError("required")) {
      return "Nutzername ist erforderlich";
    } else {
      return "";
    }
  }

  getPasswordError() {
    if (this.fc.password.hasError("required")) {
      return "Passwort ist erforderlich";
    } else {
      return "";
    }
  }

  getBackgroundUrl() {
    return "url('" + "assets/img/" + 'loginScreen.PNG' + "')";
    // return "url('" + this.assetsUrl + 'loginScreen.PNG' + "')";
  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authenticationService.login(this.fc.username.value, this.fc.password.value)
      .pipe(first())
      .subscribe(
        data => {
          // get return url from query parameters or default to home page
          this.redirectUser(data.role);
        },
        error => {
          this.error = error;
          this.loading = false;
          console.log(error);
        });
  }

  redirectUser(userRole: Role) {
    if (userRole === Role.User || userRole === Role.ExternalUser) {
      this.router.navigate(["/home"]);
    } else if (userRole === Role.Moderator) {
      this.router.navigate(["/radiolearn/list"]);
    } else if (userRole === Role.Admin) {
      this.router.navigate(["/admin"]);
    } else if (userRole === Role.demoUser || userRole === Role.tester) {
      this.router.navigate(["/list"]);
    }
  }

}

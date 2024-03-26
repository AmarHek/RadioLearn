import { Component, OnInit } from "@angular/core";
import {UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {Role} from "@app/core/models";
import {AuthenticationService, UserService} from "@app/core";
import {mustMatch} from "@app/core/helpers";

@Component({
  selector: "app-sign-up",
  templateUrl: "./sign-up.component.html",
  styleUrls: ["./sign-up.component.css"]
})
export class SignUpComponent implements OnInit {

  signUpForm: UntypedFormGroup;
  submitted = false;
  error = "";

  roles = [Role.User, Role.Moderator, Role.demoUser, Role.tester];

  private user;

  constructor(private formBuilder: UntypedFormBuilder,
              private userService: UserService,
              private authenticationService: AuthenticationService) { }

  // convenience getter for easy access to form fields
  get sc() {
    return this.signUpForm.controls;
  }

  get isAdmin() {
    return this.user && this.user.role === Role.Admin;
  }

  ngOnInit(): void {
    this.authenticationService.user.subscribe(
      (x) => {
        this.user = x;
      });

    this.signUpForm = this.formBuilder.group({
      username: ["", [Validators.required]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      confirmPass: ["", [Validators.required]],
      role: [Role.User, [Validators.required]]
    }, {
      validator: mustMatch("password", "confirmPass")
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.signUpForm.invalid) {
      return;
    } else {
      this.userService.signUp(this.sc["username"].value, this.sc["password"].value, this.sc["role"].value)
        .subscribe(
          res => {
            window.alert(res.message);
            this.error = "";
            this.signUpForm.reset();
            this.submitted = false;
          },
          err => {
            this.error = err;
          }
        );
    }
  }

}

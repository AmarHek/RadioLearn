import {Component, Input, OnInit} from "@angular/core";
import {UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {UserService} from "@app/core";
import {mustMatch} from "app/core/helpers";

@Component({
  selector: "app-change-password",
  templateUrl: "./change-password.component.html",
  styleUrls: ["./change-password.component.css"]
})
export class ChangePasswordComponent implements OnInit {

  @Input() userID: string;
  changeForm: UntypedFormGroup;
  submitted = false;
  error = "";

  constructor(private formBuilder: UntypedFormBuilder,
              private userService: UserService) { }

  get f() {
    return this.changeForm.controls;
  }

  ngOnInit(): void {
    this.changeForm = this.formBuilder.group({
      password: ["", Validators.required],
      newPassword: ["", [Validators.required, Validators.minLength(6)]],
      confirmPass: ["", Validators.required]
    },{
      validator: mustMatch("newPassword", "confirmPass")
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.changeForm.invalid) {
      return;
    } else {
      this.userService.changePassword(this.userID,
        this.f["password"].value,
        this.f["newPassword"].value)
        .subscribe(
          res => {
            window.alert(res.message);
            this.error = "";
            this.changeForm.reset();
            this.submitted = false;
          },
          err => {
            this.error = err;
          }
        );
    }
  }

}

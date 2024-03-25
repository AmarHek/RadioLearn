import { Component, OnInit } from "@angular/core";
import {User} from "app/core/models";
import {AuthenticationService} from "@app/core";

@Component({
  selector: "app-account-management",
  templateUrl: "./account-management.component.html",
  styleUrls: ["./account-management.component.scss"]
})
export class AccountManagementComponent implements OnInit {

  changeUsername = true;
  changePassword = false;

  private user: User;

  constructor(private authenticationService: AuthenticationService) { }

  get userID() {
    return this.user.id;
  }

  ngOnInit(): void {
    this.authenticationService.user.subscribe(x => this.user = x);
  }

  setChangeUsername() {
    this.changeUsername = true;
    this.changePassword = false;
  }

  setChangePassword() {
    this.changePassword = true;
    this.changeUsername = false;
  }

}

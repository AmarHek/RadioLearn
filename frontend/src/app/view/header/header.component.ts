import {Component, DoCheck, OnInit} from "@angular/core";

import {AuthenticationService, DisplayService} from "@app/core";
import {Role, User} from "app/core/models";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit, DoCheck {

  displayNavbar: boolean;
  title = "RadioLearn";

  private user: User;

  constructor(private displayService: DisplayService,
              private authenticationService: AuthenticationService) {}

  get isMod() {
    return this.user && (this.user.role === Role.Admin || this.user.role === Role.Moderator);
  }

  get isAdmin() {
    return this.user && this.user.role === Role.Admin;
  }

  ngOnInit(): void {
    this.authenticationService.user.subscribe(x => this.user = x);
    this.displayNavbar = true;
  }

  ngDoCheck(): void {
    this.displayService.update();
    this.displayNavbar = this.displayService.displayHeader;
    this.title = this.displayService.title;
  }

  logout() {
    this.authenticationService.logout();
  }

}

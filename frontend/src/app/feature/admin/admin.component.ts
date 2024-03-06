import {Component, ComponentRef, OnInit, ViewChild} from "@angular/core";
import {MatDialog} from "@angular/material/dialog";
import {Role, User} from "@app/models";
import {MatDialogService, UserService} from "@app/core";
import {ChangeRoleDialogComponent} from "@app/shared/change-role-dialog/change-role-dialog.component";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"]
})
export class AdminComponent implements OnInit {

  users: User[];

  constructor(private userService: UserService,
              private dialogService: MatDialogService,
              private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getUserList();
  }

  getUserList() {
    this.userService.getAll().subscribe(users => this.users = users);
  }

  changeRole(id: string) {
    const dialogConfig = this.dialogService.defaultConfig("400px",
      {id});
    this.dialog.open(ChangeRoleDialogComponent, dialogConfig);
  }

  deleteUser(id: string) {
    const result = window.confirm("Sicher, dass Sie den User löschen möchten?");
    if (result) {
      this.userService.deleteUser(id)
        .subscribe(
          (res) => {
          window.alert(res.message);
          this.getUserList();
        },
          err => window.alert(err));
    }
  }

}

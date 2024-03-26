import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UserService} from "@app/core";
import {Role} from "@app/core/models";

@Component({
  selector: 'app-change-role-dialog',
  templateUrl: './change-role-dialog.component.html',
  styleUrls: ['./change-role-dialog.component.css']
})
export class ChangeRoleDialogComponent implements OnInit {

  roles = [Role.Admin, Role.User, Role.Moderator, Role.demoUser, Role.tester];
  newRole: Role;
  userID: string;

  constructor(private userService: UserService,
              private dialogRef: MatDialogRef<ChangeRoleDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data) { }

  ngOnInit(): void {
    this.userID = this.data.id;
  }

  close() {
    this.dialogRef.close();
  }

  submit() {
    let result = true;
    if (this.newRole === Role.Admin) {
      result = window.confirm("Sicher, dass Sie den User zum Admin ernennen möchten?")
    }

    if (result) {
      this.userService.changeRole(this.userID, this.newRole).subscribe(res => {
        console.log(res.message);
        window.alert(res.message);
      }, err => {
        console.error(err);
        window.alert(err);
      })
    }

    this.dialogRef.close();


  }

}

import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: "app-confirm-dialog",
  templateUrl: "./confirm-dialog.component.html",
  styleUrls: ["./confirm-dialog.component.scss"]
})
export class ConfirmDialogComponent implements OnInit {

  title: string;
  message: string;
  type: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogModel) { }

  ngOnInit(): void {
    this.type = this.data.type;
    this.title = this.data.title;
    this.message = this.data.message;
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }

}

export class ConfirmDialogModel {

  constructor(
    public type: string,
    public title: string,
    public message: string) { }

}

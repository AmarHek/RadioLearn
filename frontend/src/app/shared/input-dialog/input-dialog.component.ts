import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: "app-input-dialog",
  templateUrl: "./input-dialog.component.html",
  styleUrls: ["./input-dialog.component.css"]
})
export class InputDialogComponent implements OnInit {

  title: string;
  message: string;
  input: string;

  constructor(
    public dialogRef: MatDialogRef<InputDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit(): void {
    this.title = this.data.title;
    this.message = this.data.message;
    if (this.data.input) {
      if (this.data.input.length > 0) {
        this.input = this.data.input;
      }
    } else {
      this.input = "";
    }
  }

  onConfirm(): void {
    this.dialogRef.close(this.input);
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }

}

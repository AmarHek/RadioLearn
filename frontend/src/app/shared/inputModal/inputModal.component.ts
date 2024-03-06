import { Component, OnInit, Inject } from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UntypedFormBuilder, UntypedFormGroup} from "@angular/forms";

import {displayableQuotient} from "@app/helpers";

@Component({
  selector: "app-modal",
  templateUrl: "./inputModal.component.html",
  styleUrls: ["./inputModal.component.scss"]
})
export class InputModalComponent implements OnInit {

  form: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<InputModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      text: "",
      number: null,
      date: null,
      numerator: null,
      denominator: null
    });
  }

  close() {
    this.dialogRef.close(false);
  }

  checkForm(): boolean {
    const value = this.form.value;
    return !!(value.text || value.number || value.date || (value.numerator && value.denominator));
  }

  save() {
    if(this.checkForm()) {
      this.dialogRef.close(this.form.value);
    } else {
      this.dialogRef.close(false);
    }
  }

  displayQuotient(numerator, denominator) {
    return displayableQuotient(numerator as number,
      denominator as number, 2);
  }

}

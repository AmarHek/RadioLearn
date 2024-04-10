import {Component, ElementRef, Inject, OnInit, QueryList, ViewChildren} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {DialogListVariablesComponent} from "@app/template-editor";
import {CheckBox} from "app/core/models";
import {MatChipInputEvent} from "@angular/material/chips";
import {COMMA, ENTER} from "@angular/cdk/keycodes";

@Component({
  selector: 'app-dialog-add-box',
  templateUrl: './dialog-add-box.component.html',
  styleUrls: ['./dialog-add-box.component.css']
})
export class DialogAddBoxComponent implements OnInit {

  checkBox: CheckBox = null;
  inputValue: string = "";
  title: string = "Checkbox hinzufügen";
  separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChildren('inputField') inputField: QueryList<ElementRef>;

  constructor(public dialogRef: MatDialogRef<DialogAddBoxComponent>,
              public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (data !== null) {
      this.checkBox = data.boxToEdit;
      this.inputValue = this.checkBox.name;
      this.title = "Checkbox bearbeiten"

    } else {
      this.checkBox = {keys: [], normal: false, text: "", value: false, variables: [], kind: "box", name: ""};
    }
  }

  ngOnInit(): void {
  }

  onConfirm(): void {
    this.checkBox.name = this.inputField.first.nativeElement.value;
    this.dialogRef.close(this.checkBox)
  }

  onCancel(): void {
    this.dialogRef.close()
  }

  openListVariableDialog() {
    const dialogData = {
      displayName: 'Checkbox "' + this.inputField.first.nativeElement.value + '"',
      variables: JSON.parse(JSON.stringify(this.checkBox.variables)),
    };

    this.dialog.open(DialogListVariablesComponent, {
      width: '600px',
      data: dialogData,
    }).afterClosed().subscribe(result => {
      if (result === undefined) return;
      this.checkBox.variables = result;
    });
  }

  addSynonym(event: MatChipInputEvent) {
    const name = (event.value || '').trim();
    if (!name) return;
    this.checkBox.keys.push(name)
    event.chipInput.clear()
  }

  removeSynonym(synonym: string) {
    const index = this.checkBox.keys.indexOf(synonym);
    if (index >= 0) {
      this.checkBox.keys.splice(index, 1);
    }
  }
}

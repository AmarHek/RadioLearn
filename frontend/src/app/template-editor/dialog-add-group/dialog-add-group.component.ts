import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {DialogListVariablesComponent} from "@app/template-editor";
import {Group, Option} from "app/core/models";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatChipInputEvent} from "@angular/material/chips";

@Component({
  selector: 'app-dialog-add-group',
  templateUrl: './dialog-add-group.component.html',
  styleUrls: ['./dialog-add-group.component.css']
})
export class DialogAddGroupComponent implements OnInit {

  @ViewChild('optionInput') optionInputRef: ElementRef;
  group: Group = null;
  title: string = "Gruppe hinzufügen";
  separatorKeysCodes: number[] = [ENTER, COMMA];
  selectedOption: Option = null;

  constructor(public dialogRef: MatDialogRef<DialogAddGroupComponent>,
              public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (data !== null) {
      this.group = data.groupToEdit;
      this.title = "Gruppe bearbeiten"
    } else {
      this.group = {kind: "group", name: "group_name", options: []};
    }
  }

  ngOnInit(): void {
  }

  addGroupOption(event: MatChipInputEvent): void {
    const name = (event.value || '').trim();
    if (!name) return;
    this.group.options.push({kind: "option", name: name, text: "", normal: false, variables: [], keys: []});
    event.chipInput!.clear();
  }

  removeOption(option: Option): void {
    this.group.options.splice(this.group.options.indexOf(option), 1);
    if (this.selectedOption === option) {
      this.selectedOption = null;
    }
  }

  onChipSelect(option: Option) {
    this.selectedOption = option
  }

  addSynonym(event: MatChipInputEvent) {
    const name = (event.value || '').trim();
    if (!name) return;
    this.selectedOption.keys.push(name)
    event.chipInput.clear()
  }

  removeSynonym(synonym: string) {
    const index = this.selectedOption.keys.indexOf(synonym);
    if (index >= 0) {
      this.selectedOption.keys.splice(index, 1);
    }
  }

  // checks if at least two options are filled in, to allow confirmation of dialog
  checkAtLeastTwoFilled(): boolean {
    let count = 0;
    for (let i = 0; i < this.group.options.length; i++) {
      if (this.group.options[i] !== null && this.group.options[i].name.length > 0) {
        count++;
      }
    }
    return count >= 2;
  }

  onCancel(): void {
    this.dialogRef.close()
  }

  onConfirm(): void {
    this.dialogRef.close(this.group)
  }

  openListVariablesDialog(name: string) {
    const dialogData = {
      displayName: 'Option "' + name + '"',
      variables: this.group.options.find(option => option.name === name).variables
    };
    this.dialog.open(DialogListVariablesComponent, {
      width: '600px',
      data: dialogData
    }).afterClosed().subscribe(result => {
      if (result === undefined) return;
      this.group.options.find(option => option.name === name).variables = result;
    });
  }

}

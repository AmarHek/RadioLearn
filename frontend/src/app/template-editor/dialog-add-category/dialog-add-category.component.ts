import {Component, ElementRef, Inject, OnInit, QueryList, ViewChildren} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-dialog-add-category',
  templateUrl: './dialog-add-category.component.html',
  styleUrls: ['./dialog-add-category.component.css']
})
export class DialogAddCategoryComponent implements OnInit {

  title: string = "Kategorie hinzufügen";
  categoryNames = [];
  inputValue = "";
  @ViewChildren('inputField') inputField: QueryList<ElementRef>;


  constructor(public dialogRef: MatDialogRef<DialogAddCategoryComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data === null) return
    this.categoryNames = data.categoryNames;

    // If data.categoryName is not null, we are editing a category
    if (data.categoryName != null) {
      this.title = "Kategorie umbenennen";
      this.inputValue = data.categoryName;
      console.log(this.categoryNames)
    }
  }

  ngOnInit(): void {
  }

  onCancel() {
    this.dialogRef.close()
  }

  onConfirm() {
    this.dialogRef.close(this.inputField.first.nativeElement.value)
  }

  validCategoryName() {
    return this.inputValue.length > 0 && !this.categoryAlreadyExists()
  }

  categoryAlreadyExists() {
    return this.categoryNames.includes(this.inputValue)
  }

}

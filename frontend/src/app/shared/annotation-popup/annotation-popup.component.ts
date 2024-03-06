import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CheckBox, Selectable} from "@app/models";

@Component({
  selector: 'app-annotation-popup',
  templateUrl: './annotation-popup.component.html',
  styleUrls: ['./annotation-popup.component.css']
})
export class AnnotationPopupComponent implements OnInit {

  readonly NO_VAR_SELECTION_STRING = "Keine Spezifizierung";
  pathologies: Selectable[];
  selectedPathology: string = "";
  options: string[] = [];
  title = "Diagnose"

  constructor(
    private dialogRef: MatDialogRef<AnnotationPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
  }

  ngOnInit(): void {
    // initially fill displayed options with pathologies
    this.pathologies = this.data.categories[0].selectables
    this.pathologies.forEach(selectable => {
      this.options.push(selectable.name)
    })
  }

  close() {
    this.dialogRef.close(false)
  }

  optionSelected(name) {
    this.options = []
    if (this.selectedPathology == "") {
      // pathology has been selected
      this.selectedPathology = name
      this.title = name

      // find the correct pathology and check if it has vars
      let pat = this.pathologies.map(pat => pat as CheckBox)
        .find(pat => pat.name == this.selectedPathology && pat.variables.length > 0)

      if (pat == undefined){
        // close dialog if no further variables can be selected
        this.dialogRef.close(name)
      } else {
        // if pathology has variables, populate options array with variables
        if (pat.variables[0].kind == "oc") {
          pat.variables[0].values.forEach(value => {
            this.options.push(value)
          })
        } else if (pat.variables[0].kind == "mc") {
          pat.variables[0].values.forEach(value => {
            this.options.push(value[0])
          })
          this.options.push("Keine Spezifizierung")
        }
      }
      return
    }
    // variable was selected
    let result = this.selectedPathology + " | " + name
    if (name == this.NO_VAR_SELECTION_STRING){
      // don't append option text if it is "Keine Spezifizierung"
      result = this.selectedPathology
    }
    this.dialogRef.close(result)
  }

}

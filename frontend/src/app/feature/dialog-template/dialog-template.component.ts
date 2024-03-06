import { Component, OnInit } from '@angular/core';
import {MatLegacyDialogRef as MatDialogRef} from "@angular/material/legacy-dialog";
import {surveyLinkClicked} from "@app/helpers/localStorageHelper";

@Component({
  selector: 'app-dialog-template',
  templateUrl: './dialog-template.component.html',
  styleUrls: ['./dialog-template.component.css']
})
export class DialogTemplateComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DialogTemplateComponent>) {}

  ngOnInit(): void {
  }

  linkClicked(){
    surveyLinkClicked()
  }

}

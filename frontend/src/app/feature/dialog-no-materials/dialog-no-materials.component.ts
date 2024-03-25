import { Component, OnInit } from "@angular/core";
import {increaseResetCounter, surveyLinkClicked} from "@app/core/helpers/localStorageHelper";

@Component({
  selector: "app-dialog-no-materials",
  templateUrl: "./dialog-no-materials.component.html",
  styleUrls: ["./dialog-no-materials.component.css"]
})
export class DialogNoMaterialsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  linkClicked(){
    surveyLinkClicked();
  }

  resetProgress(){
    increaseResetCounter();
  }

}

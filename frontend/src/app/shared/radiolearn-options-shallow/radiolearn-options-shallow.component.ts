import {Component, Input, OnInit} from '@angular/core';
import * as M from "@app/models/templateModel";
import {Material} from "@app/models";

@Component({
  selector: 'app-radiolearn-options-shallow',
  templateUrl: './radiolearn-options-shallow.component.html',
  styleUrls: ['./radiolearn-options-shallow.component.css']
})
export class RadiolearnOptionsShallowComponent implements OnInit {

  @Input() material: Material;
  @Input() userMode: boolean;
  @Input() shallowCategories: M.Category[];
  @Input() deepCategories: M.Category[];
  @Input() selectedSelectableID: string;

  constructor() { }

  updateFromParent(selectable){
    // in the shallow selection list there are no exclusionary boxes that need to be checked / unchecked, additionally
    // there are no group options that need the option to be deselected, therefore no action is needed here.
    return
  }

  updateFromVariable(selectable){
    // in the shallow selection list, variables are not clickable if a parent is not active, so there is no need to
    // set the parent to active when a variable is clicked
    return
  }

  ngOnInit(): void {
  }

}

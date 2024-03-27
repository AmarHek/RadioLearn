import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import * as M from "@app/core/models/templateModel";
import {Material} from "@app/core/models";

@Component({
  selector: 'app-options-shallow',
  templateUrl: './options-shallow.component.html',
  styleUrls: ['./options-shallow.component.css']
})
export class OptionsShallowComponent implements OnInit {

  @Input() material: Material;
  @Input() userMode: boolean;
  @Input() categories: M.Category[];
  @Input() selectedSelectableID: string;
  @Output() updateEmitter = new EventEmitter<string>();

  constructor() { }

  updateFromParent(selectable){
    // in the shallow selection list there are no exclusionary boxes that need to be checked / unchecked, additionally
    // there are no group options that need the option to be deselected, therefore no action is needed here.
    this.updateEmitter.emit()
    return
  }

  updateFromVariable(selectable){
    // in the shallow selection list, variables are not clickable if a parent is not active, so there is no need to
    // set the parent to active when a variable is clicked
    this.updateEmitter.emit()
    return
  }

  ngOnInit(): void {
  }

}

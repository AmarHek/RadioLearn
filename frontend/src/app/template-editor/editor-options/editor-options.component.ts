import {Component, Input, OnInit, Output, EventEmitter} from "@angular/core";

import {DataParserService} from "@app/core";
import {Row} from "@app/core/models";

import * as M from "@app/core/models/templateModel";

@Component({
  selector: "editor-options",
  templateUrl: "./editor-options.component.html",
  styleUrls: ["./editor-options.component.scss"]
})

export class EditorOptionsComponent implements OnInit {

  @Input() categories: M.Category[];
  @Output() clickEvent = new EventEmitter<any>();
  @Input() layoutId: number;
  @Input() selectedCat: string;
  @Input() selectedSelectableID: string;

  @Output() editClickEvent = new EventEmitter<any>();
  @Output() removeClickEvent = new EventEmitter<any>();


  maxRowLength: number;
  width: number;
  rows: Row[];
  hoveredRow = -1;
  hoveredColumn = -1;
  hoveredGroupID = "";

  constructor(public dataParser: DataParserService) {
  }

  ngOnInit(): void {
    this.maxRowLength = 5;
    this.determineWidth();
    this.initRows(this.categories);
  }

  initRows(changedCategories: any) {
    this.categories = changedCategories;
    this.rows = this.dataParser.extractRows(this.categories, this.maxRowLength);
  }

  edit(elementToEdit: any) {
    this.editClickEvent.emit(elementToEdit)
  }

  remove(elementToRemove: any) {
    this.removeClickEvent.emit(elementToRemove)
  }

  private determineWidth() {
    this.width = 88 / this.maxRowLength;
  }
}


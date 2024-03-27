import {Component, EventEmitter, Input, Output} from "@angular/core";
import * as M from "@app/core/models/templateModel";
import {DataParserService} from "@app/core";

@Component({
  selector: "app-options",
  templateUrl: "./options.component.html",
  styleUrls: ["./options.component.scss"]
})
export class OptionsComponent {

  @Input() categories: M.Category[];
  @Input() paramMapID: string; // for detecting changes
  @Input() selectedCat: string;
  @Input() selectedSelectableID: string;
  @Output() nextCat = new EventEmitter<string>();
  @Output() updateEmitter = new EventEmitter<string>();

  constructor(public dataParser: DataParserService) { }

  getSelectedCatIndex() {
    if (this.categories !== undefined) {
      for (const category of this.categories) {
        if (category.name === this.selectedCat) {
          return this.categories.indexOf(category);
        }
      }
    }
  }

  nextCategory() {
    const idx = this.getSelectedCatIndex();
    const nextIdx = Math.min(idx + 1, this.categories.length - 1);
    this.nextCat.emit(this.categories[nextIdx].name);
  }

  previousCategory() {
    const idx = this.getSelectedCatIndex();
    const nextIdx = Math.max(idx - 1, 0);
    this.nextCat.emit(this.categories[nextIdx].name);
  }
}

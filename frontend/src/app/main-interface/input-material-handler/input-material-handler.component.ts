import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ENTER} from "@angular/cdk/keycodes";
import {Category, ChipColors, InputChip, TopLevel} from "@app/core/models";
import {ChipHelperService} from "@app/core/services/chip-helper.service";
import {DataParserService, InputParserService} from "@app/core";

@Component({
  selector: 'app-input-material-handler',
  templateUrl: './input-material-handler.component.html',
  styleUrls: ['./input-material-handler.component.css']
})
export class InputMaterialHandlerComponent implements OnInit {

  @ViewChild("chipInput") chipInput: ElementRef<HTMLInputElement> | undefined;

  @Input() defaultCategories: Category[];
  @Input() categories: Category[];

  @Output() resetEmitter = new EventEmitter<any>();
  @Output() selectedChipEmitter = new EventEmitter<[string, string]>();
  @Output() inputEventEmitter = new EventEmitter<any>();


  chips: InputChip[] = [];
  input = "";
  mergedInput = "";
  selectedSelectableID = "";
  selectedCat = "undefined";



  separatorKeysCodes: number[] = [ENTER];
  constructor(private chipHelper: ChipHelperService,
              private inputParser: InputParserService,
              private dataParser: DataParserService) { }

  ngOnInit(): void {
    setTimeout(()=>this.chipInput.nativeElement.focus(), 5)
  }

  onInput() {
    // return;
    console.log("oninput")
    //Remove chips showing unrecognized text
    this.chipHelper.removeRedChips(this.chips);
    //remember old chips to prevent change of category if no new correct chip has been found
    const oldChips = JSON.stringify(this.chips);
    // Combine existing chips and text input into one input line
    this.mergedInput = this.chipHelper.getMergedInput(this.inputParser.autocorrect(this.input), this.chips);
    //Parse this input, assign the values and generate the new chips accordingly
    this.inputParser.parseInput(this.mergedInput);
    this.assignValues();
    this.generateChips();
    //navigate to category of last chip
    if (this.chips.length > 0 && JSON.stringify(this.chips) !== oldChips) {
      this.selectedCat = this.chips[this.chips.length - 1].id.split(" ")[0];
    }
    // Remove everything that was detected as a clickable or variable from the input
    this.mergedInput = this.chipHelper.getTextWithoutVariables(this.mergedInput, this.inputParser.foundVariables);
    this.mergedInput = this.chipHelper.getTextWithoutClickables(this.mergedInput, this.inputParser.foundClickables);
    //Add a red chip containing unrecognized text if there is any
    if (this.mergedInput.trim() !== "") {
      this.chips.push(new InputChip(this.mergedInput, ChipColors.RED, null));
    }
    //Clear the text input
    this.input = "";
    this.chipInput.nativeElement.value = "";

    this.inputEventEmitter.emit()
  }

  generateChips() {
    this.selectedSelectableID = "";
    this.chips = this.chipHelper.generateChipsForCategories(this.defaultCategories, this.categories);
  }

  assignValues() {
    // Assigns all found keywords in inputParser to this.parts
    this.dataParser.assignValuesFromInputParser(this.categories, this.inputParser.foundClickables,
      this.inputParser.foundVariables);
  }

  remove(chip: InputChip): void {
    const index = this.chips.indexOf(chip);
    if (index >= 0) {
      this.chips.splice(index, 1);
    }
    this.resetEmitter.emit()
  }

  focusInput(){
    this.chipInput.nativeElement.focus()
  }

  reset() {
    this.chips = [];
    this.selectedCat = this.categories[0].name;
    this.selectedSelectableID = "";
    this.input = "";
  }

  // HANDLE CHIPS
  onChipClick(chip: InputChip) {
    this.selectedCat = chip.id.split(" ")[0];
    this.selectedSelectableID = chip.id;
    this.selectedChipEmitter.emit([this.selectedCat, this.selectedSelectableID])
  }
}

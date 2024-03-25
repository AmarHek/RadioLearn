import {Injectable} from '@angular/core';
import {
  Category,
  CheckBox,
  ChipColors,
  Group,
  InputChip,
  KeyClickable,
  KeyVariable, Option, Variable
} from "app/core/models";

@Injectable({
  providedIn: 'root'
})
export class ChipHelperService {

  constructor() {
  }

  /**
   * Returns a string containing the content of all existing InputChips separated by whitespaces, concatenated with
   * the user input at the end.
   * @param input Raw user input string
   * @param chips List of already existing InputChips
   */
  getMergedInput(input: string, chips: InputChip[]) {
    return chips.map(c => c.content).join(" ") + input
  }

  generateChipForGroup(group: Group, catName: string): InputChip {
    let option = group.options.find(o => o.name == group.value)
    return this.generateGenericChip(option, catName)
  }

  generateChipForBox(box: CheckBox, catName: string): InputChip {
    return this.generateGenericChip(box, catName)
  }

  /**
   * Generates a chip for a checkbox or a group option, containing its name and variable text.
   * The color of the chip will be green, if all variables have been filled out, otherwise it will be yellow.
   * @param element The element for which a chip should be generated
   * @param catName The category to which the element belongs, necessary to generate a unique element ID
   */
  generateGenericChip(element: Option | CheckBox, catName: string) {
    let chipText = element.keys[0]
    let varInfo = this.getVarTextAndCount(element.variables)
    let varText = varInfo[0]
    let activeVarCount = varInfo[1]
    chipText += varText
    let variablesComplete = activeVarCount == element.variables.length
    let chipColor = variablesComplete ? ChipColors.GREEN : ChipColors.YELLOW
    return new InputChip(chipText, chipColor, catName + " " + element.name)
  }

  /**
   * Returns a tuple [varText, varCount] containing the variable text for the variables of one clickable,
   * and the number of active variables (deviating from their default values)
   * @param variables List of variables of one clickable, where text and active count should be extracted
   */
  getVarTextAndCount(variables: Variable[]) {
    let varText = ""
    let activeVars = 0
    variables.forEach(variable => {
      if (variable.kind == "oc" && variable.value != null) {
        let key: string
        if (variable.keys == null) {
          key = variable.value
        } else {
          key = variable.keys[variable.values.indexOf(variable.value)][0]
        }
        varText += " " + variable.textBefore + key + variable.textAfter
        activeVars++
      } else if (variable.kind == "number" && variable.value != undefined) {
        varText += " " + variable.textBefore + variable.value + variable.textAfter
        activeVars++
      } else if (variable.kind == "mc") {
        let anyMcActive = false
        variable.values.forEach(value => {
          if (value[1]) {
            varText += " " + value[0]
            anyMcActive = true
          }
        })
        if (anyMcActive) activeVars++
      } else if (variable.kind == "text" && variable.value != "") {
        varText += " " + variable.textBefore + variable.value + variable.textAfter
        activeVars++
      } else if (variable.kind == "date" && variable.value != undefined) {
        varText += " " + variable.textBefore + variable.value.day + "." + variable.value.month + "." + variable.value.year + variable.textAfter
        activeVars++
      }
    })
    return [varText, activeVars]
  }

  /**
   * Returns a list of InputChips corresponding to the discrepancies between the filled out
   * categories and the provided defaultCategories of default values.
   * @param defaultCategories List of TopLevel parts with their default values
   * @param categories Modified list of TopLevel parts, to be represented by the returned InputChips
   */
  generateChipsForCategories(defaultCategories: Category[], categories: Category[]): InputChip[] {
    let result = []
    defaultCategories.forEach((defaultCat, defaultCatIndex) => {
      defaultCat.selectables.forEach((defaultSel, defaultSelIndex) => {
        if (defaultSel.kind == "group") {
          let parsedDefaultSel = defaultSel as Group
          let parsedSel = (categories[defaultCatIndex] as Category).selectables[defaultSelIndex] as Group
          if (parsedDefaultSel.value != parsedSel.value) {
            result.push(this.generateChipForGroup(parsedSel, defaultCat.name))
          }
        } else if (defaultSel.kind == "box") {
          let parsedDefaultSel = defaultSel as CheckBox
          let parsedSel = (categories[defaultCatIndex] as Category).selectables[defaultSelIndex] as CheckBox
          // Todo, decide on behavior for checkboxes which are default checked to true like "Indikation geprüft"
          if (parsedDefaultSel.value != parsedSel.value && parsedSel.value) {
            result.push(this.generateChipForBox(parsedSel, defaultCat.name))
          }
        }
      })
    })
    return result
  }

  /**
   * Checks whether the char at index in the mergedInput belongs to any of the detected variables
   * @param index Index of the char within the input
   * @param mergedInput Input combining user input and text of already existing InputChips
   * @param variables List of all found variables
   */
  charBelongsToVariable(index: number, mergedInput: string, variables: KeyVariable[]) {
    for (let varCounter = 0; varCounter < variables.length; varCounter++) {
      let v = variables[varCounter]
      if (v.kind == "ratio" && v.value === undefined) return false
      if (v.kind == "date" && v.value === undefined) return false
      if (v.kind == "date") {
        const dateVar = mergedInput.substring(v.position, v.positionEnd);
        let trimAmount = 0;
        for (let i = dateVar.length - 1; i > -1; i--) {
          if (!this.isNumeric(dateVar[i])) {
            trimAmount += 1
          } else {
            break
          }
        }
        if (index >= v.position && index <= v.positionEnd - trimAmount) {
          return true
        }
      } else if (index >= v.position && index <= v.positionEnd) {
        return true
      }
    }
    return false
  }

  getTextWithoutVariables(mergedInput: string, foundVariables: Map<String, KeyVariable[]>) {
    let textNoVars = ""
    let allVars: KeyVariable[] = []
    foundVariables.forEach(list => {
      list.forEach(v => allVars.push(v))
    })
    for (let i = 0; i < mergedInput.length; i++) {
      if (!this.charBelongsToVariable(i, mergedInput, allVars)) {
        textNoVars += mergedInput[i]
      }
    }
    return textNoVars
  }

  getTextWithoutClickables(mergedInput: string, foundClickables: KeyClickable[]): string {
    foundClickables.sort(fc => fc.synonym.length).forEach(fc => {
      const searchMask = fc.synonym;
      const regEx = new RegExp(searchMask, "i");
      mergedInput = mergedInput.replace(regEx, "")
    })
    return mergedInput
  }

  isNumeric(s) {
    return !isNaN(s - parseFloat(s));
  }

  removeRedChips(chips) {
    for (const chip of chips) {
      if (chip.color != ChipColors.RED) continue
      const index = chips.indexOf(chip);
      if (index < 0) continue
      chips.splice(index, 1);
    }
  }
}

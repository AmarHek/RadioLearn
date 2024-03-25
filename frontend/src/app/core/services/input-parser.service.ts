import { Injectable } from "@angular/core";

import * as M from "@app/core/models/templateModel";
import {KeyVariable, KeyClickable} from "app/core/models";
import { levenshtein, getAllIndexOf, getNextHighestValue, getClickableKeywords,
         getSplitters, parseValue, getVariableKeywords} from "app/core/helpers";
import {Category} from "@app/core/models/templateModel";

@Injectable({
  providedIn: "root"
})
export class InputParserService {

  clickableKeywords: KeyClickable[] = [];
  varKeyDictionary: Map<string, KeyVariable[]> = new Map<string, KeyVariable[]>();

  foundClickables: KeyClickable[] = [];
  foundVariables: Map<string, KeyVariable[]> = new Map<string, KeyVariable[]>();

  primaryDictionary: Set<string>;

  constructor() {
  }

  init(categories: Category[]): void {
    this.initializeKeywords(categories);
    this.initializeDictionary();
  }

  reset() {
    this.foundClickables = [];
    this.foundVariables = new Map<string, KeyVariable[]>();
  }

  fixUnits(inputString: string): string {
    return inputString.replace(/Millimeter/g,"mm").replace(/Zentimeter/g, "cm");
  }

  autocorrect(inputString: string): string {
    inputString = this.fixUnits(inputString);
    const possibleWords: string[] = Array.from(this.primaryDictionary);
    const inputSplit = inputString.split(" ");
    inputSplit.forEach((word, idx) => {
      const distances: number[] = possibleWords.map((possibleWord) =>
        levenshtein(word.toLowerCase(), possibleWord.toLocaleLowerCase()));
      if (!distances.includes(0)) {
        if (word.length >= 3 && word.length < 8) {
          if (distances.includes(1)) {
            const replacement = distances.indexOf(1);
            inputSplit[idx] = possibleWords[replacement];
          }
        } else if (word.length >= 8) {
          if (distances.includes(1)) {
            const replacement = distances.indexOf(1);
            inputSplit[idx] = possibleWords[replacement];
          } else if (distances.includes(2)) {
            const replacement = distances.indexOf(2);
            inputSplit[idx] = possibleWords[replacement];
          }
        }
      }
    });
    return inputSplit.join(" ");
  }

  // wrapper for all functions
  parseInput(input: string) {
    this.reset();
    // Possibly reinitialize when starting
    this.findClickables(input);
    const varText = this.getTextBetweenClickables(input);
    if (varText.length > this.foundClickables.length) {
      // TODO
      // This means that the first variable text is from the previous input
      // if lastKeyword is not null, use that, otherwise use dummy varKey
      // for now just ignore though
      const overText = varText.shift();
    }
    for (let i = 0; i < varText.length; i++) {
      this.findVariableKeywords(varText[i], this.foundClickables[i], input);
    }
  }

  // Finds all Clickable Keywords in an input string
  findClickables(input: string) {
    let foundKeywordsTemp: KeyClickable[] = [];
    for (const keyword of this.clickableKeywords) {
      // gets all positions of this keyword within the input
      // finding all keywords (and not just the last) is necessary for proper coloring later
      // and for finding all variables
      const positions: number[] = getAllIndexOf(keyword.synonym, input, false);
      if (positions.length >= 1) {
        for (const pos of positions) {
          const keywordWithPos: KeyClickable = JSON.parse(JSON.stringify(keyword));
          keywordWithPos.position = pos;
          foundKeywordsTemp.push(keywordWithPos);
        }
      }
    }
    // this removes keywords that are substrings of other keywords (e.g. "Aufnahme" and "Aufnahme von heute")
    // console.log(foundKeywordsTemp);
    foundKeywordsTemp = this.filterOverlap(foundKeywordsTemp);
    // this removes keywords that are substrings of other words, i.e. that don't have a leading white space
    foundKeywordsTemp = this.filterIncompleteOverlap(input, foundKeywordsTemp);
    foundKeywordsTemp.sort(this.compareKeywords);
    this.foundClickables = foundKeywordsTemp;
  }

  //Removes clickables that touch another word at the beginning
  //If "Herzschrittmache" is entered, this method removes the clickable "CHE" that is detected in the input, which was
  //obviously not intended by the input, but is not removed as overlap, since "Herzschrittmacher" is not detected yet
  filterIncompleteOverlap(input: string, foundClickables: KeyClickable[]){
    const result = [];
    foundClickables.forEach(fc => {
      if(fc.position === 0) {
        result.push(fc);
      } else if(input[fc.position-1] === " ") {
        result.push(fc);
      }
    });
    return result;
  }

  // find all Variable Keywords in input string (typically just a fraction of the entire string)
  //This gets called with just part of the input string, the varText for each clickable and the corresponding clickable
  findVariableKeywords(varText: string, clickKey: KeyClickable, input: string) {
    const relativePosition = clickKey.position + clickKey.synonym.length + 1;
    const id: string = clickKey.category + " " + clickKey.name;
    let foundVariablesTemp: KeyVariable[] = [];
    if(this.foundVariables.get(id) != undefined){
      foundVariablesTemp = this.foundVariables.get(id)
    }
    const possibleVariables = this.varKeyDictionary.get(id);

    if (varText.length <= 0 || possibleVariables === undefined) {
      return;
    }

    const splitters: number[] = getSplitters(possibleVariables, varText);
    for (const varKey of possibleVariables) {
      if (varKey.kind === "oc" || varKey.kind === "mc") {
        // gets all positions of this keyword within the input. One keyword is generated per input
        // finding all keywords (and not just the last) is required for proper coloring later
        const positions: number[] = getAllIndexOf(varKey.synonym, varText, false);
        if (positions.length >= 1) {
          for (const pos of positions) {
            const newVarKey: KeyVariable = JSON.parse(JSON.stringify(varKey));
            // check if textBefore is present, if textBefore exists, and adjust position
            if (varKey.textBefore.length > 0 &&
              varText.toLowerCase().substring(pos - varKey.textBefore.length, pos) === varKey.textBefore.toLowerCase()) {
              newVarKey.position = pos + relativePosition - varKey.textBefore.length;
            } else {
              newVarKey.position = pos + relativePosition;
            }
            // check if textAfter is present, if textBefore exists, and adjust end-position
            if (varKey.textAfter.length > 0 &&
              varText.toLowerCase().substring(pos + varKey.synonym.length,
                pos + varKey.synonym.length + varKey.textAfter.length) === varKey.textAfter.toLowerCase()) {
              newVarKey.positionEnd = pos + varKey.synonym.length + varKey.textAfter.length + relativePosition;
            } else {
              newVarKey.positionEnd = pos + varKey.synonym.length + relativePosition;
            }
            foundVariablesTemp.push(newVarKey);
          }
        }
      } else {
        const positions: number[] = getAllIndexOf(varKey.textBefore, varText, false);
        for (const pos of positions) {
          const posValueStart = pos + varKey.textBefore.length;
          let posValueEnd: number;
          let textAfterDetected = false;
          if (varKey.textAfter.length === 0) {
            posValueEnd = getNextHighestValue(splitters, posValueStart);
            if (posValueEnd === -1) {
              posValueEnd = varText.length;
            } else {
              posValueEnd--;
            }
          } else {
            posValueEnd = varText.toLowerCase().indexOf(varKey.textAfter.toLowerCase(), pos);
            textAfterDetected = posValueEnd !== -1;
          }
          //todo, if no textAfter is detected, posValueEnd is -1, so substring from posValueStart to -1?
          const valueString = varText.substring(posValueStart, posValueEnd).trim();
          const newVarKey = JSON.parse(JSON.stringify(varKey));
          newVarKey.position = pos + relativePosition;
          // no need to check for existence of textAfter and textBefore since they always need to be present here
          // (if textAfter exists in this case. textBefore must always exist)
          const afterTextAddition = textAfterDetected ? varKey.textAfter.length : 0;
          newVarKey.positionEnd = posValueEnd + relativePosition + afterTextAddition;
          newVarKey.value = parseValue(valueString, newVarKey.kind);
          foundVariablesTemp.push(newVarKey);
        }
      }
    }
    foundVariablesTemp = this.filterVariableOverlap(input, foundVariablesTemp);
    foundVariablesTemp.sort(this.compareKeywords);
    this.foundVariables.set(id, foundVariablesTemp);
  }

  //Remove variables that start in the middle of another word
  filterVariableOverlap(input: string, foundVariables: KeyVariable[]){
    const result = [];
    foundVariables.forEach(fv => {
      if(input[fv.position-1] === " ") {
result.push(fv);
}
    });
    return result;
  }

  // Removes all synonyms/keywords that are substrings of another synonym/keyword
  filterOverlap(foundKeywords: KeyClickable[]): KeyClickable[] {
    // filters out keyword synonyms that are substrings of another keyword
    const fKCopy = JSON.parse(JSON.stringify(foundKeywords));
    let toRemove: KeyClickable[] = [];
    for (const keyword of fKCopy) {
      const overlap: KeyClickable[] = fKCopy.filter((kw) =>
        keyword.synonym !== kw.synonym && // do not filter out the same synonym
        keyword.position <= kw.position && // kw must be right of keyword
        kw.position < (keyword.position + keyword.synonym.length) && // kw must be contained within keyword
        kw.synonym.length < keyword.synonym.length // kw must be shorter than keyword
      );
      toRemove = toRemove.concat(overlap);
    }
    // console.log("found:", foundKeywords);
    // console.log("remove:", toRemove);
    for (const removable of toRemove) {
      //this check is necessary, since toRemove can contain duplicates of the same clickable
      //E.g. the input "2. Shaldon-Katheter" produces the toRemove template-list "Shaldon", "Shaldon-Katheter", "Shaldon"
      //After the first shaldon gets removed, splice is called with -1 as start index, removing the wrong elements
      if(fKCopy.indexOf(removable) === -1) {
continue;
}
      fKCopy.splice(fKCopy.indexOf(removable), 1);
    }
    return fKCopy;
  }

  getTextBetweenClickables(input: string): string[] {
    const result: string[] = [];

    const splitRight: number[] = [];
    const splitLeft: number[] = [0];

    for (const keyword of this.foundClickables) {
      splitRight.push(keyword.position);
      splitLeft.push(keyword.position + keyword.synonym.length);
    }
    splitRight.push(input.length);

    if (splitRight[0] === 0) {
      splitLeft.shift();
      splitRight.shift();
    }
    for (let i = 0; i < splitLeft.length; i++) {
      result.push(input.substring(splitLeft[i], splitRight[i]).trim());
    }

    return result;
  }

  // sorts keywords based on their position in the input string
  compareKeywords(arg1: KeyClickable | KeyVariable, arg2: KeyClickable | KeyVariable): number {
    if (arg1.position > arg2.position) {
      return 1;
    } else if (arg1.position < arg2.position) {
      return -1;
    } else {
      return 0;
    }
  }

  private initializeKeywords(categories: M.Category[]): void {
    let clickKeys: KeyClickable[] = [];
    clickKeys.push({
      name: "Rest normal",
      synonym: "Rest normal",
      category: "normal",
      position: -1,
      nVariables: 0
    });
    for (const cat of categories) {
      const tempSelectables: KeyClickable[] = getClickableKeywords(cat.selectables, cat.name);
      clickKeys = clickKeys.concat(tempSelectables);
      this.extractVariableKeywords(cat.selectables, cat.name);
    }
    this.clickableKeywords = clickKeys;
  }

  private initializeDictionary(): void {
    this.primaryDictionary = new Set<string>();
    for (const clickKey of this.clickableKeywords) {
      const split: string[] = clickKey.synonym.split(" ");
      split.forEach((word) => this.primaryDictionary.add(word));
    }
    for (const variables of this.varKeyDictionary.values()) {
      for (const varKey of variables) {
        if (varKey.synonym) {
          const split: string[] = varKey.synonym.split(" ");
          split.forEach((word) => this.primaryDictionary.add(word));
        }
        if (varKey.textAfter) {
          const split: string[] = varKey.textAfter.split(" ");
          split.forEach((word) => this.primaryDictionary.add(word));
        }
        if (varKey.textBefore) {
          const split: string[] = varKey.textBefore.split(" ");
          split.forEach((word) => this.primaryDictionary.add(word));
        }
      }
    }
  }

  // Takes template-list of Selectables from a category and converts their variables into Keywords and adds them to the varKeyDict
  private extractVariableKeywords(selectables: M.Selectable[], category: string): void {
    let varKeys: KeyVariable[];
    let id: string;
    for (const sel of selectables) {
      if (sel.kind === "box") {
        id = category + " " + sel.name;
        varKeys = getVariableKeywords(sel.variables, category, sel.name);
        if (varKeys.length > 0) {
          this.varKeyDictionary.set(id, varKeys);
        }
      } else if (sel.kind === "group") {
        for (const option of sel.options) {
          id = category + " " + option.name;
          varKeys = getVariableKeywords(option.variables, category, option.name);
          if (varKeys.length > 0) {
            this.varKeyDictionary.set(id, varKeys);
          }
        }
      }
    }
  }

}

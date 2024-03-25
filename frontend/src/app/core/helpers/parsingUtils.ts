import * as M from "@app/core/models/templateModel";
import {KeyClickable, KeyVariable} from "@app/core/models";
import {getAllIndexOf} from "@app/core/helpers/util";

export const getClickableKeywords = (selectables: M.Selectable[], category: string): KeyClickable[] => {
  const clickKey: KeyClickable[] = [];
  for (const sel of selectables) {
    if (sel.kind === "box") {
      for (const synonym of sel.keys) {
        clickKey.push({
          name: sel.name,
          synonym,
          category,
          position: -1,
          nVariables: sel.variables.length
        });
      }
    } else if (sel.kind === "group") {
      for (const option of sel.options) {
        for (const synonym of option.keys) {
          clickKey.push({
            name: option.name,
            synonym,
            category,
            group: sel.name,
            position: -1,
            nVariables: option.variables.length
          });
        }
      }
    }
  }
  return clickKey;
};

// Gets current template-list of possible variables and input-string.
// Since not all variables have "textAfter", we must search for all possible split or end keywords to extract the
// value strings
export const getSplitters = (varKeys: KeyVariable[], input: string): number[] => {
  const splitWords: string[] = [];
  let splitters: number[] = [];
  for (const varKey of varKeys) {
    if (varKey.textBefore.length > 0) {
      splitWords.push(varKey.textBefore);
    }
    if (varKey.synonym !== undefined) {
      splitWords.push(varKey.synonym);
    }
  }
  for (const splitWord of splitWords) {
    splitters = splitters.concat(getAllIndexOf(splitWord, input, false));
  }
  splitters = [...new Set(splitters)].sort();
  return splitters;
};

// takes the value and kind of variable and parses the string accordingly
// text: nothing happens; number: converts to number; date: extracts day, month and year; ratio: extracts num. and den.
export const parseValue = (valueString: string, varKind: string) => {
  if (varKind === "text") {
    return valueString;
  } else if (varKind === "number") {
    if (!isNaN(+valueString)) {
      return Number(valueString);
    }
  } else if (varKind === "date") {
    const dateString = valueString
      .match(/(0?[1-9]|[12]\d|30|31)[^\w\d\r\n:](0?[1-9]|1[0-2])[^\w\d\r\n:](\d{4}|\d{2})/);
    if (dateString !== null) {
      const date = dateString[0].split(/[.-\/]+/g);
      return {year: date[2], month: date[1], day: date[0]};
    }
  } else if (varKind === "ratio") {
    const ratioString = valueString.match(/\d* .* \d*/);
    if (ratioString !== null) {
      const ratioNumbers = ratioString[0].split(/[\s:\/]+/);
      return [Number(ratioNumbers[0]), Number(ratioNumbers[1])];
    }
  }
  return undefined;
};

// takes template-list of variable keywords and counts number of uniquely appearing variable IDs
export const countUniqueVariableKeywords = (variableKeywords: KeyVariable[]): number => {
  const foundIDs: string[] = [];
  let result = 0;
  for (const varKey of variableKeywords) {
    if (!foundIDs.includes(varKey.id)) {
      result++;
      foundIDs.push(varKey.id);
    }
  }
  return result;
};

// only display the most recent selected option variables
export const filterUniqueOptions = (variableKeywords: KeyVariable[]): KeyVariable[] => {
  const result: KeyVariable[] = [];
  const foundIDs: string[] = [];
  for (let i = variableKeywords.length - 1; i >= 0; i--) {
    if (variableKeywords[i].kind === "oc") {
      if (!foundIDs.includes(variableKeywords[i].id)) {
        foundIDs.push(variableKeywords[i].id);
        result.push(variableKeywords[i]);
      }
    } else {
      result.push(variableKeywords[i]);
    }
  }
  return result.reverse();
};

// Takes template-list of variables and generates Keyword Variables template-list
export const getVariableKeywords = (variables: M.Variable[], category: string, clickable: string): KeyVariable[] => {
  const varKeys: KeyVariable[] = [];
  for (const variable of variables) {
    if (variable.kind === "oc" || variable.kind === "mc") {
      for (let i = 0; i < variable.values.length; i++) {
        let name: string;
        if (variable.kind === "mc") {
          name = variable.values[i][0];
        } else {
          name = variable.values[i];
        }
        for (const key of variable.keys[i]) {
          varKeys.push({
            category,
            selectable: clickable,
            id: variable.id,
            kind: variable.kind,
            name,
            synonym: key,
            textBefore: variable.textBefore,
            textAfter: variable.textAfter,
            position: -1,
            positionEnd: -1
          });
        }
      }
    } else {
      varKeys.push({
        category,
        selectable: clickable,
        id: variable.id,
        kind: variable.kind,
        textBefore: variable.textBefore,
        textAfter: variable.textAfter,
        position: -1,
        positionEnd: -1
      });
    }
  }

  return varKeys;
};

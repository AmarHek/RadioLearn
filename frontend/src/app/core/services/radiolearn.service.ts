import {Injectable} from "@angular/core";
import {
  Annotation, BoxLabel,
  Category,
  CheckBox,
  Group,
  Selectable,
  Template,
  Variable,
  VariableMC,
  VariableNumber,
  VariableOC,
  VariableText
} from "app/core/models";
import {
  CategoryError,
  SelectableError,
  VariableError,
  VariableMCError,
  VariableValueError
} from "@app/core/models/errorModel";
import * as M from "@app/core/models/templateModel";

@Injectable({
  providedIn: "root"
})
export class RadiolearnService {

  workMode: string;
  drawMode: boolean;

  constructor() {
  }

  // takes filled out template from material and returns empty template to be filled out
  resetTemplate(template: Template) {
    for (const el of template.parts) {
      if (el.kind === "category") {
        for (const sel of el.selectables) {
          if (sel.kind === "group") {
            sel.value = null;
            for (const option of sel.options) {
              if (option.variables.length > 0) {
                option.variables = this.resetVariable(option.variables);
              }
            }
          } else if (sel.kind === "box") {
            sel.value = false;
            if (sel.variables.length > 0) {
              sel.variables = this.resetVariable(sel.variables);
            }
          }
        }
      }
    }
    return template;
  }

  // auxiliary method to reset variables
  resetVariable(variables: Variable[]): Variable[] {
    for (const variable of variables) {
      if (variable.kind === "oc") {
        variable.value = null;
      } else if (variable.kind === "mc") {
        for (const val of variable.values) {
          val[1] = false;
        }
      } else if (variable.kind === "number") {
        variable.value = 0;
      } else if (variable.kind === "text") {
        variable.value = "";
      }
    }
    return variables;
  }

  getBoxLabels(category: M.Category): BoxLabel[] {
    const boxLabels: BoxLabel[] = [];
    for (const sel of category.selectables) {
      if (sel.kind === "box") {
        this.pushBoxLabel(boxLabels, sel);
      } else if (sel.kind === "group") {
        for (const option of sel.options) {
          this.pushBoxLabel(boxLabels, option);
        }
      }
    }
    return boxLabels;
  }

  pushBoxLabel(boxLabels: BoxLabel[], clickable: M.Clickable) {
    let variableLabels = [];
    if (clickable.variables.length > 0) {
      variableLabels = this.getVariableLabels(clickable);
    }
    boxLabels.push({
      name: clickable.name,
      subLabels: variableLabels
    });
  }

  getVariableLabels(clickable: M.Clickable): string[] {
    const variableLabels: string[] = [];
    for (const variable of clickable.variables) {
      if (variable.kind === "oc") {
        for (const value of variable.values) {
          variableLabels.push(value);
        }
      } else if (variable.kind === "mc") {
        for (const value of variable.values) {
          variableLabels.push(value[0]);
        }
      }
    }
    return variableLabels;
  }

  // takes shallow (or any kind of) template and annotations and fills out the template by these values
  fillShallowTemplateByBoxAnnotations(shallowTemplate: M.Template, annotations: {
    main: Annotation[];
    lateral?: Annotation[];
    pre?: Annotation[];
  }) {
    const modes = ["main", "lateral", "pre"];

    const labels: string[] = [];

    // first get all annotations as strings
    for (const mode of modes) {
      if (annotations[mode] !== undefined && annotations[mode] !== null) {
        if (annotations[mode].length > 0) {
          for (const annotation of annotations[mode]) {
            if (!labels.includes(annotation.label)) {
              labels.push(annotation.label);
            }
          }
        }
      }
    }

    // IMPORTANT: Reset shallowTemplate first, otherwise changes from deleting boxes will apply
    this.resetTemplate(shallowTemplate);

    const diagnosis = shallowTemplate.parts[0] as Category;

    // if annotations are empty: "Unauffälliger Röntgen-Thorax"
    if (labels.length === 0) {
      // first value is always "Unauffälliger Röntgen-Thorax --> set to true
      diagnosis.selectables[0].value = true;
    } else {
      for (const label of labels) {
        let clickableName = "";
        let variableName = "";
        // check if "pure" label (no variable suffix)
        if (label.includes(" | ")) {
          clickableName = label.split(" | ")[0];
          variableName = label.split(" | ")[1];
        } else {
          clickableName = label;
        }

        // Now check and fill out diagnosis category
        for (const sel of (diagnosis.selectables as CheckBox[])) {
          if (sel.name === clickableName) {
            sel.value = true;
            if (variableName.length > 0 && sel.variables.length > 0) {
              for (const variable of sel.variables) {
                if (variable.kind === "oc") {
                  for (const value of variable.values) {
                    if (value === variableName) {
                      variable.value = value;
                    }
                  }
                } else if (variable.kind === "mc") {
                  for (const value of variable.values) {
                    if (variableName === value[0]) {
                      value[1] = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

  }

  // checks the report-output-options of a group and returns that option's normal value
  getGroupNormal(group: Group) {
    for (const option of group.options) {
      if (group.value === option.name) {
        return option.normal;
      }
    }
    // if no normal value is given, return false by default
    return false;
  }

// -----------------------------------------
// STUDENT ERROR COMPARISON FUNCTIONS BELOW
// -----------------------------------------

  // Wrapper function for student and ground truth template comparison
  compareTemplates(originalTemplate: Template, studentTemplate: Template,
                   templateType: string = "XRay"): CategoryError[] {
    if (templateType === "XRay") {
      return this.compareTemplatesXRay(originalTemplate, studentTemplate);
    }
  }

  // Top-Level Function to compare X-Ray templates of student and ground truth
  // Pleuraerguss is a special case and therefore hard coded
  compareTemplatesXRay(originalTemplate: Template, studentTemplate: Template): CategoryError[] {
    const errors = [];

    // check if templates have same length
    if (originalTemplate.parts.length !== studentTemplate.parts.length) {
      // For debugging purposes
      console.error("Length of parts is not the same. Please check your methods.");
      return [];
    }

    // iterate through categories
    for (let i = 0; i < originalTemplate.parts.length; i++) {
      if (originalTemplate.parts[i].kind === "category") {
        const originalCategory: Category = originalTemplate.parts[i] as Category;
        const studentCategory: Category = studentTemplate.parts[i] as Category;

        // first check the three special cases and push accordingly (the sub-methods do all required checks themselves)
        if (originalCategory.name === "Pleuraerguss") {
          const peError = this.comparePE(originalCategory, studentCategory);
          if (peError !== undefined) {
            errors.push(peError);
          }
        } else {
          // get category errors and only push if at least one error is found
          const catError = this.compareCategories(originalTemplate.parts[i] as Category,
            studentTemplate.parts[i] as Category);
          if (catError.selErrors.length > 0) {
            errors.push(catError);
          } else if (catError.name === "ExceptionDummy") { // This is for debugging
            console.error("Something went wrong on OG " + (originalTemplate.parts[i] as Category).name + " and Stud " +
              (studentTemplate.parts[i] as Category).name);
          }
        }
      }
    }
    return errors;
  }

  // Lower level template comparison function, for categories
  compareCategories(originalCategory: Category, studentCategory: Category): CategoryError {
    console.log(originalCategory, studentCategory);
    // If categories are not the same, something went wrong before and an exception dummy is returned for error handling
    if (originalCategory.selectables.length !== studentCategory.selectables.length ||
      originalCategory.name !== studentCategory.name) {
      // Debugging
      console.error("Different categories!");
      return {
        name: "ExceptionDummy",
        selErrors: []
      };
    }

    // Generate empty category error
    const catError = {
      name: studentCategory.name,
      selErrors: []
    };

    // Iterate through selectables (each category has at least one selectable)
    for (let i = 0; i < originalCategory.selectables.length; i++) {
      let selError: SelectableError;
      // Check if names are the same, otherwise error
      if (originalCategory.selectables[i].name === studentCategory.selectables[i].name) {
        selError = this.compareSelectable(originalCategory.selectables[i],
          studentCategory.selectables[i]);
      } else {
        console.error("Something went wrong on " + originalCategory.selectables[i].name + " and " +
        studentCategory.selectables[i].name + ", skipping");
        continue;
      }
      // Only add error, if should and actual are different or if there are variable errors
      if (selError !== undefined) {
        catError.selErrors.push(selError);
      }
    }

    return catError;
  }

  // lower level template comparison method, for selectables
  compareSelectable(originalSel: Selectable, studentSel: Selectable): SelectableError {
    let selError;
    if (originalSel.kind === "box" && studentSel.kind === "box") {
      // for box just get variable error and add should and actual values
      // it's okay if should and actual are the same, check for actual error happens in higher level
      const varErr = this.compareVariables(originalSel.variables, studentSel.variables);
      selError = {
        kind: "box",
        name: originalSel.name,
        should: originalSel.value ? originalSel.name : "Nichts",
        actual: studentSel.value ? studentSel.name : "Nichts",
        normal: studentSel.normal,
        varErrors: varErr
      };
    } else if (originalSel.kind === "group" && studentSel.kind === "group") {
      // Variable error is only necessary for correct option (because comparison of variables between report-output-options makes no sense)
      // If original option is null, variable error is empty (for obvious reasons)
      let varErr: VariableError[] = [];
      console.log(originalSel.value !== null);
      console.log(originalSel.value);
      if (originalSel.value !== null && originalSel.value !== undefined) {
        // find variables of corresponding option in option template-list
        const originalVars: Variable[] = originalSel.options.find(option => option.name === originalSel.value).variables;
        const studentVars: Variable[] = studentSel.options.find(option => option.name === originalSel.value).variables;
        // get variable errors
        console.log(originalVars, studentVars);
        varErr = this.compareVariables(originalVars, studentVars);
      }
      // generate selectable error
      selError = {
        kind: "group",
        name: originalSel.name,
        should: ((originalSel.value !== null && originalSel.value !== undefined) ? originalSel.value : "Nichts"),
        actual: ((studentSel.value !== null && studentSel.value !== undefined) ? studentSel.value : "Nichts"),
        normal: this.getGroupNormal(studentSel),
        varErrors: varErr
      };
    } else {
      // Debugging stuff
      console.error("Selectable kind is not the same!");
    }

    // return error, if there is one, otherwise return undefined
    if ((selError.should !== selError.actual) || (selError.varErrors.length > 0)) {
      return selError;
    } else {
      return undefined;
    }
  }

  // lower level template comparison function, for variables
  compareVariables(originalVars: Variable[], studentVars: Variable[]): VariableError[] {
    const varErr: VariableError[] = [];

    if (originalVars === undefined || studentVars === undefined || (originalVars.length !== studentVars.length)) {
      console.error("One or more function parameters are problematic!");
    } else {
      // iterate through variables
      for (let i = 0; i < originalVars.length; i++) {
        // get variables with proper type
        let err: VariableError;
        const shouldVar = originalVars[i];
        const actualVar = studentVars[i];
        // differentiate variable types
        if (shouldVar.kind === "mc") {
          err = this.compareVariableMC(shouldVar as VariableMC, actualVar as VariableMC);
        } else if (shouldVar.kind === "oc") {
          err = this.compareVariableOC(shouldVar as VariableOC, actualVar as VariableOC);
        } else if (shouldVar.kind === "text") {
          err = this.compareVariableValue(shouldVar as VariableText, actualVar as VariableText);
        } else {
          err = this.compareVariableValue(shouldVar as VariableNumber, actualVar as VariableNumber);
        }

        if (err !== undefined) {
          varErr.push(err);
        }
      }
    }
    return varErr;
  }

  // comparison function for mc variables
  compareVariableMC(originalVar: VariableMC, studentVar: VariableMC): VariableMCError {
    const shouldValues = originalVar.values;
    const actualValues = studentVar.values;
    const should: string[] = [];
    const actual: string[] = [];
    // check if arrays are different and only iterate, if they are:
    if (shouldValues !== actualValues) {
      for (let j = 0; j < shouldValues.length; j++) {
        // only add "true" selections to should and actual
        if (shouldValues[j][1]) {
          should.push(shouldValues[j][0]);
        }
        if (actualValues[j][1]) {
          actual.push(actualValues[j][0]);
        }
      }
    }
    if (should !== actual && should.length > 0 && actual.length > 0) {
      return {
        id: originalVar.id,
        kind: "mc",
        should,
        actual
      };
    } else {
      return undefined;
    }
  }

  // comparison function for OC variables
  compareVariableOC(originalVar: VariableOC, studentVar: VariableOC): VariableValueError {
    if (originalVar.value !== studentVar.value) {
      return {
        id: originalVar.id,
        kind: "value",
        should: ((originalVar.value !== null && originalVar.value !== undefined) ? originalVar.value : "Nichts"),
        actual: ((studentVar.value !== null && studentVar.value !== undefined) ? studentVar.value : "Nichts")
      };
    } else {
      return undefined;
    }
  }

  // comparison function for value variables
  compareVariableValue(originalVar: VariableText | VariableNumber,
                       studentVar: VariableText | VariableNumber): VariableValueError {
    if (originalVar.value !== studentVar.value) {
      return {
        id: originalVar.id,
        kind: "value",
        should: originalVar.value,
        actual: studentVar.value
      };
    } else {
      return undefined;
    }
  }


  // hard coded comparison case for Pleuraerguss
  comparePE(originalCat: Category, studentCat: Category): CategoryError {

    const originalSels = originalCat.selectables as CheckBox[];
    const studentSels = studentCat.selectables as CheckBox[];

    const peErrors: SelectableError[] = [];

    // Mehrere Fälle durchgehen, je nach Status der Lösung
    // 1. Fall: Lösung sagt kein PE, dann normal durchiterieren und alles, was nicht 'kein PE' ist, als falsch werten
    //  (der Text für Lösung ist dabei immer kein PE)
    if (originalSels[0].value) {
      // Iterieren und alle, die Student mit "wahr" markiert hat, als Fehler werten (bei "kein PE" umgekehrt)
      if (!studentSels[0].value) {
        peErrors.push({
          kind: "box",
          should: originalSels[0].name,
          actual: "Nichts",
          normal: originalSels[0].normal,
          varErrors: []
        });
      }
      for (let i = 1; i < studentSels.length; i++) {
        if (studentSels[i].value) {
          peErrors.push({
            kind: "box",
            should: originalSels[0].name,
            actual: "Nichts",
            normal: originalSels[0].normal,
            varErrors: []
          });
        }
      }
    } else {
      // 2. Fall: Durchgehen, welche Auswahlmöglichkeiten stimmen und sammeln
      //  Gleiches für Studentenauswahl
      const originalTrueIndex: number[] = [];
      const studentTrueIndex: number[] = [];
      for (let i = 0; i < originalSels.length; i++) {
        if (originalSels[i].value) {
          originalTrueIndex.push(i);
        }
        if (studentSels[i].value) {
          studentTrueIndex.push(i);
        }
      }
      // Um später Fehler zu vermeiden: prüfen, ob "kein PE" von Student als wahr markiert wurde und separat bearbeiten
      if (studentTrueIndex.includes(0)) {
        peErrors.push({
          kind: "box",
          should: "Nichts",
          actual: "kein PE",
          normal: true,
          varErrors: []
        });
        // "kein PE" (also Index 0) entfernen
        studentTrueIndex.splice(studentTrueIndex.indexOf(0), 1);
      }
      //  Dann abgleichen: gleiche Auswahlen werden präferiert, ansonsten z.B. O gering - S deutlich machen
      //  und die entsprechenden Variablen prüfen (also Variablen von O gering mit denen von S deutlich vergleichen)
      const toRemove: number[] = []; // temp array, um nach dem ersten Durchlauf alle geklärten Einträge zu löschen
      for (const idx of originalTrueIndex) {
        // Gleiche Auswahlen präferieren (gering zu gering etc.)
        if (studentTrueIndex.includes(idx)) {
          const varErrors = this.compareVariables(originalSels[idx].variables, studentSels[idx].variables);
          if (originalSels[idx].value !== studentSels[idx].value) {
            if (originalSels[idx].value) {
              peErrors.push({
                kind: "box",
                should: originalSels[idx].name,
                actual: "Nichts",
                normal: originalSels[idx].normal,
                varErrors
              });
            } else {
              peErrors.push({
                kind: "box",
                should: "Nichts",
                actual: studentSels[idx].name,
                normal: originalSels[idx].normal,
                varErrors
              });
            }
          }
          toRemove.push(idx); // Später entfernen
        }
      }
      // Nach dem Loop: alle abgeglichenen Indexe aus den Arrays entfernen
      if (toRemove.length > 0) {
        for (const idx of toRemove) {
          // einmal für originalSels
          let index = originalTrueIndex.indexOf((idx));
          if (index > -1) {
            originalTrueIndex.splice(index, 1);
          }
          // und einmal für studentSels
          index = studentTrueIndex.indexOf((idx));
          if (index > -1) {
            studentTrueIndex.splice(index, 1);
          }
        }
      }
      // Zum Schluss: Durch das längere der Arrays iterieren und die restlichen Errors erstellen
      if (originalTrueIndex.length >= studentTrueIndex.length) {
        for (let i = 0; i < originalTrueIndex.length; i++) {
          // studentTrueIndex Ende erreicht?
          if (i >= studentTrueIndex.length) {
            const varErrors = this.compareVariables(originalSels[originalTrueIndex[i]].variables,
              studentSels[originalTrueIndex[i]].variables);
            peErrors.push({
              kind: "box",
              should: originalSels[originalTrueIndex[i]].name,
              actual: "Nichts",
              normal: false,
              varErrors
            });
          } else { // ansonsten der Reihe nach weiter
            const varErrors = this.compareVariables(originalSels[originalTrueIndex[i]].variables,
              studentSels[studentTrueIndex[i]].variables);
            peErrors.push({
              kind: "box",
              should: originalSels[originalTrueIndex[i]].name,
              actual: studentSels[studentTrueIndex[i]].name,
              normal: false,
              varErrors
            });
          }
        }
      } else { // Gleiches Spiel nochmal, nur umgekehrt
        for (let i = 0; i < studentTrueIndex.length; i++) {
          // studentTrueIndex Ende erreicht?
          if (i >= originalTrueIndex.length) {
            const varErrors = this.compareVariables(originalSels[studentTrueIndex[i]].variables,
              studentSels[studentTrueIndex[i]].variables);
            peErrors.push({
              kind: "box",
              should: "Nichts",
              actual: studentSels[studentTrueIndex[i]].name,
              normal: false,
              varErrors
            });
          } else { // ansonsten der Reihe nach weiter
            const varErrors = this.compareVariables(originalSels[originalTrueIndex[i]].variables,
              studentSels[studentTrueIndex[i]].variables);
            peErrors.push({
              kind: "box",
              should: originalSels[originalTrueIndex[i]].name,
              actual: studentSels[studentTrueIndex[i]].name,
              normal: false,
              varErrors
            });
          }
        }
      }
    }
    if (peErrors.length > 0) {
      return {
        name: "PE",
        selErrors: peErrors as SelectableError[]
      };
    } else {
      return undefined;
    }
  }
}

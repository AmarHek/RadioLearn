import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";

export interface TextExtractor {
  ofCheckbox(c: CheckBox): string | undefined;
  ofOption(o: Option): string | undefined;
  ofEnumeration(e: Enumeration): string | undefined;
  ofBlock(e: Block): string | undefined;
  ofConditional(c: Conditional): string | undefined;
}

export interface Template {
  _id: string;
  name: string;
  kind: "deepDoc" | "shallowDoc";
  timestamp: number;
  parts: TopLevel[];
}

export type TopLevel = Category | Block | Enumeration | Conditional;

// Main data management and display class

export interface Category {
  kind: "category";
  name: string;
  optional?: boolean;
  selectables: Selectable[];
}

export interface Block {
  kind: "block";
  text?: string;
  judgementText?: string;
}

export interface Enumeration {
  kind:           "enumeration";
  text:           string;
  judgementText?: string;
  id:             string;
}

export interface Conditional {
  kind:           "conditional";
  precondition:   Literal[][];
  normalText?:    string;
  judgementText?: string;
}

export interface Literal {
  id:      string;
  negated: boolean;
}

// Selectable classes, lower than category

export type Selectable = CheckBox | Group;
export type Clickable  = CheckBox | Option;

export interface CheckBox {
  kind:           "box";
  name:           string;
  value:          boolean;
  text:           string;
  judgementText?: string;
  normal:         boolean;
  exclusions?:    string[];   // template-list of boxes that are deselected, when selecting this
  variables:      Variable[];
  enumeration?:   string;
  keys:           string[];
}

export interface Group {
  kind:    "group";
  name:    string;
  options: Option[];
  value?:  string;
}

export interface Option {
  kind:           "option";
  groupID?:       string;
  name:           string;
  text:           string;
  judgementText?: string;
  normal:         boolean;
  variables:      Variable[];
  keys:           string[];
}

// Variable types

export type Variable = VariableOC | VariableMC | VariableText | VariableNumber | VariableDate;

export interface VariableCommon {
  id:         string;
  textBefore: string;
  textAfter:  string;
  keys?:      string[][];
}

export interface VariableOC extends VariableCommon {
  kind:   "oc";
  value?: string;
  values: string[];
}

export interface VariableMC extends VariableCommon {
  kind:   "mc";
  values: [string, boolean][];
}

export interface VariableText extends VariableCommon {
  kind:  "text";
  value: string;
}

export interface VariableNumber extends VariableCommon {
  kind:  "number";
  value: number;
}

export interface VariableDate extends VariableCommon {
  kind:  "date";
  value: NgbDateStruct;
}


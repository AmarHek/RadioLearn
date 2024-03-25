export interface CategoryError {
  name: string;
  selErrors: SelectableError[];
}

export type SelectableError = GroupError | CheckboxError;

export interface GroupError {
  kind: "group";
  name: string;
  should: string;
  actual: string;
  normal: boolean;
  varErrors: VariableError[];
}

export interface CheckboxError {
  kind: "box";
  should: string;
  actual: string;
  normal: boolean;
  varErrors: VariableError[];
}

export type VariableError = VariableRatioError | VariableMCError | VariableValueError;

export interface VariableCommonError {
  id: string;
}

export interface VariableMCError extends VariableCommonError {
  kind: "mc";
  should: string[];
  actual: string[];
}

export interface VariableRatioError extends VariableCommonError{
  kind: "ratio";
  shouldNum: number;
  shouldDenom: number;
  actualNum: number;
  actualDenom: number;
}

export interface VariableValueError extends VariableCommonError {
  kind: "value";
  should: string | number;
  actual: string | number;
}

// auxiliary error for table computation
export interface ErrorTableRow {
  catName: string;
  catRowSize: number;
  selError: SelectableError;
  selRowSize: number;
  varError: VariableError;
}

export interface ErrorTableRowMobile {
  selError?: SelectableError;
  varError?: SelectableError;
}

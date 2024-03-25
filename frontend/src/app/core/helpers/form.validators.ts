import { UntypedFormGroup } from "@angular/forms";
import {getFileExtension} from "@app/core/helpers/util";


// custom validator to check that two fields match
export const mustMatch = (controlName: string, matchingControlName: string) => (formGroup: UntypedFormGroup) => {
  const control = formGroup.controls[controlName];
  const matchingControl = formGroup.controls[matchingControlName];

  if (matchingControl.errors && !matchingControl.errors.mustMatch) {
    // return if another validator has already found an error on the matchingControl
    return;
  }

  // set error on matchingControl if validation fails
  if (control.value !== matchingControl.value) {
    matchingControl.setErrors({mustMatch: true});
  } else {
    matchingControl.setErrors(null);
  }
};

export const fileValidator = (controlName: string) => (formGroup: UntypedFormGroup) => {
  const allowedFiles = ["json", "xlsx"];
  const control = formGroup.controls[controlName];

  if (control.errors && !control.errors.filetype) {
    return;
  }

  const extension = getFileExtension(control.value.name);
  if(!allowedFiles.includes(extension)) {
    control.setErrors({filetype: true});
    return ({filetype: true});
  } else {
    control.setErrors(null);
    return null;
  }


};

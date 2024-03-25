import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CategoryError, ErrorTableRow, ErrorTableRowMobile, SelectableError} from "@app/core/models/errorModel";
import {displayableQuotient} from "app/core/helpers";
import {DisplayService} from "@app/core";

@Component({
  selector: "app-radiolearn-differences",
  templateUrl: "./student-errors.component.html",
  styleUrls: ["./student-errors.component.scss"]
})
export class StudentErrorsComponent implements OnInit {

  errorRows: ErrorTableRow[] = [];
  errorRowsMobile: ErrorTableRowMobile[] =[];
  majorErrorCount = 0;
  minorErrorCount = 0;

  isMobile = false;

  constructor(
    private displayService: DisplayService,
    private dialogRef: MatDialogRef<StudentErrorsComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit(): void {
    this.countMajorAndMinorErrors();
    this.errorRows = this.data.errors;
    this.displayService.isMobile.subscribe(res =>{
      this.isMobile = res;
      this.rollOutErrors();
    });
  }

  close() {
    this.dialogRef.close(false);
  }

  next() {
    this.dialogRef.close(true);
  }

  rollOutErrors() {
    if (!this.isMobile) {
      this.rollOutErrorsNormal();
    } else {
      this.rollOutErrorsMobile();
    }
  }

  rollOutErrorsNormal() {
    this.errorRows = [];
    // row variables
    let catName: string;
    let catRowSize: number;
    let selError: SelectableError;
    let selRowSize: number;

    for (const catErr of this.data.errors) {

      for (const selErr of catErr.selErrors) {
        // set up rowspan of category error only for 0th element
        if (catErr.selErrors.indexOf(selErr) === 0) {
          catName = catErr.name;
          catRowSize = this.catRowCount(catErr);
        } else {
          catName = "";
          catRowSize = 0;
        }

        // only iterate, if there are any variable errors and differentiate the cases
        if (selErr.varErrors.length > 0) {
          // iterate variables, one row per variable
          for (const varErr of selErr.varErrors) {
            // set up rowspan of selError only for 0th element
            if (selErr.varErrors.indexOf(varErr) === 0) {
              selError = selErr;
              selRowSize = selErr.varErrors.length;
            } else {
              selError = null;
              selRowSize = 0;
              // important: set catRowSize to 0 here, otherwise all selRows will contain a catRowSize, leading to errors
              catRowSize = 0;
              catName = "";
            }
            // push row in variable case
            this.errorRows.push({
              catName,
              catRowSize,
              selError,
              selRowSize,
              varError: varErr
            });
          }

        } else {
          // for no variables, row needs to be pushed separately in this case
          this.errorRows.push({
            catName,
            catRowSize,
            selError: selErr,
            selRowSize: 1,
            varError: null
          });
        }
      }
    }
  }

  rollOutErrorsMobile() {
    this.errorRowsMobile = [];
    for (const catErr of this.data.errors) {
      for (const selError of catErr.selErrors) {
        this.errorRowsMobile.push({
          selError
        });
        if (selError.varErrors.length > 0) {
          for (const varError of selError.varErrors) {
            this.errorRowsMobile.push({
              varError
            });
          }
        }
      }
    }
  }

  displayQuotient(numerator, denominator) {
    return displayableQuotient(numerator as number,
      denominator as number, 2);
  }

  catRowCount(catError: CategoryError) {
    let result = 0;
    for (const selError of catError.selErrors) {
      const varCount = selError.varErrors.length;
      result += varCount > 0 ? varCount : 1;
    }
    return result;
  }

  countMajorAndMinorErrors() {
    // reset/initialize error count
    this.majorErrorCount = 0;
    this.minorErrorCount = 0;

    for (const catError of this.data.errors) {
      for (const selError of catError.selErrors) {
        // for major errors, simply check if should and actual are different and count accordingly
        if (selError.should !== selError.actual) {
          this.majorErrorCount += 1;
        }
        // iterate variables for minor errors
        for (const varErr of selError.varErrors) {
          if (varErr.kind === "mc") {
            // for mc variables, compute symmetric difference between should and actual
            const difference = varErr.should
                              .filter(x => !varErr.actual.includes(x))
                              .concat(varErr.actual.filter(x => !varErr.should.includes(x)));
            this.minorErrorCount += difference.length;
          } else {
            // remaining variable types are simple check as above
            if (varErr.should !== varErr.actual) {
              this.minorErrorCount += 1;
            }
          }
        }
      }
    }
  }

}

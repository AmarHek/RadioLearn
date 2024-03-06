import {Component, Inject, OnInit} from "@angular/core";
import {UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from "@angular/material/legacy-dialog";
import {BackendCallerService} from "@app/core";

@Component({
  selector: "app-add-scan-dialog",
  templateUrl: "./add-scan-dialog.component.html",
  styleUrls: ["./add-scan-dialog.component.scss"]
})
export class AddScanDialogComponent implements OnInit {

  fileForm: UntypedFormGroup;
  uploading = false;
  supportedFileTypes = ["image/png", "image/jpeg", "image/jpg"];

  message: string;
  progress = 0;


  constructor(private backendCaller: BackendCallerService,
              private dialogRef: MatDialogRef<AddScanDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data) { }

  ngOnInit(): void {
    this.fileForm = new UntypedFormGroup({
      newScan: new UntypedFormControl(null, {validators: [Validators.required]})
    });
  }

  onFileSelect(event) {
    if (event.target.files.length > 0) {
      const files = event.target.files;
      if (this.fileFilter(files[0])) {
        this.fileForm.get("newScan").setValue(files[0]);
      }
    }
  }

  fileFilter(file: File): boolean {
    if (!(this.supportedFileTypes.includes(file.type))) {
      window.alert("Die Datei " + file.name + " besitzt ein nicht unterstütztes Dateiformat. " +
        "Bitte nur PNG oder JPEG hochladen.");
      return false;
    }
    return true;
  }

  submit(): void {
    this.uploading = true;
    const formData = new FormData();
    formData.append("scanType", this.data.scanType);
    formData.append("id", this.data.dirID);
    formData.append("newScan", this.fileForm.get("newScan").value);

    console.log(this.fileForm.get("newScan").value);

    this.backendCaller.addScan(this.data.id, formData).subscribe(() => {
      this.progress = 100;
      setTimeout(() => this.close(), 1000);
    }, err => {
      this.message = err;
      console.log(err);
    });
  }

  close() {
    this.dialogRef.close();
  }

}

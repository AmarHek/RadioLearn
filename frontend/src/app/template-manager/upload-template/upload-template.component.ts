import {Component, OnInit} from "@angular/core";
import {MatDialogRef} from "@angular/material/dialog";
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";

import {BackendService} from "@app/core";
import {fileValidator, getFileExtension} from "@app/core/helpers";

@Component({
  selector: "app-upload-template",
  templateUrl: "./upload-template.component.html",
  styleUrls: ["./upload-template.component.scss"]
})
export class UploadTemplateComponent implements OnInit {

  uploadForm: UntypedFormGroup;
  submitted = false;

  constructor(private dialogRef: MatDialogRef<UploadTemplateComponent>,
              private formBuilder: UntypedFormBuilder,
              private backendCaller: BackendService) { }

  // convenience getter for easy access to form fields
  get fc() {
    return this.uploadForm.controls;
  }

  get file() {
    return this.uploadForm.get("file");
  }

  ngOnInit() {
    this.uploadForm = this.formBuilder.group({
      name: new UntypedFormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      file: new UntypedFormControl(null, {validators: [Validators.required]}),
      kind: new UntypedFormControl(null, {validators: [Validators.required]})
    }, {
      validator: fileValidator("file")
    });
  }

  onFileSelect(event) {
    if (event.target.files.length > 0) {
      this.uploadForm.get("file").setValue(event.target.files[0]);
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.uploadForm.invalid) {
      return;
    } else {
      const extension = getFileExtension(this.uploadForm.value.file.name);
      const timestamp = this.uploadForm.value.file.lastModified as string;
      const postData = new FormData();
      postData.append("name", this.uploadForm.value.name);
      postData.append("file", this.uploadForm.value.file);
      postData.append("kind", this.uploadForm.value.kind);
      postData.append("timestamp", timestamp);
      if (extension === "xlsx") {
        this.backendCaller.addTemplateFromExcel(postData)
          .subscribe({next: (res) => {
          window.alert(res.message);
          this.uploadForm.reset();
          this.close();
        }, error: (err) => {
            console.log(err);
            window.alert(err);
          }});
      }
    }
  }

  close() {
    this.dialogRef.close();
  }
}

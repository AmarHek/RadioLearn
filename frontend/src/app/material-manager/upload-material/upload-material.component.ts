import { Component, OnInit } from "@angular/core";
import {UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";
import {nanoid} from "nanoid";
import {MatDialogRef} from "@angular/material/dialog";

import {BackendService, FilesSortingService} from "@app/core";
import {Template} from "@app/core/models/templateModel";

@Component({
  selector: "app-upload-template-material",
  templateUrl: "./upload-material.component.html",
  styleUrls: ["./upload-material.component.scss"]
})
export class UploadMaterialComponent implements OnInit {

  uploadForm: UntypedFormGroup;

  deepDocTemplates: Template[];
  shallowDocTemplates: Template[];

  mainFlags: boolean[] = [];
  lateralRedFlags: boolean[] = [];
  lateralYellowFlags: boolean[] = [];
  preRedFlags: boolean[] = [];
  preYellowFlags: boolean[] = [];

  ignoreFlags = false;
  currentPresetID: number;
  currentCustomID: "";

  supportedFileTypes = ["image/png", "image/jpeg", "image/jpg"];
  progress = 0;
  uploading = false;
  messages: string[] = [];

  constructor(private backendCaller: BackendService,
              private dialogRef: MatDialogRef<UploadMaterialComponent>,
              private filesSorter: FilesSortingService) { }

  ngOnInit(): void {
    this.initForm();
    this.filesSorter.setCustomIdentifier("");
    this.backendCaller.getTemplatesByKind("deepDoc").subscribe(res => {
      this.deepDocTemplates = res.templates;
    }, err => {
      console.log(err.message);
    });
    this.backendCaller.getTemplatesByKind("shallowDoc").subscribe(res => {
      this.shallowDocTemplates = res.templates;
    }, err => {
      console.log(err.message);
    });
  }

  initForm() {
    this.uploadForm = new UntypedFormGroup({
      mainScans: new UntypedFormControl([], {validators: [Validators.required]}),
      lateralScans: new UntypedFormControl([]),
      preScans: new UntypedFormControl([]),
      deepDocTemplate: new UntypedFormControl(null, {validators: [Validators.required]}),
      shallowDocTemplate: new UntypedFormControl(null, {validators: Validators.required})
    });
  }

  stringify(dict) {
    return JSON.stringify(dict);
  }

  updateIdentifier(custom: boolean, id: string | number) {
    this.ignoreFlags = false;

    if (custom) {
      this.currentPresetID = undefined;
      this.filesSorter.setCustomIdentifier(id as string);
    } else {
      this.currentCustomID = "";
      this.filesSorter.setPresetIdentifier(id as number);
    }
    this.flagFiles();
  }

  setIgnoreFlags(id: string) {
    if (this.ignoreFlags) {
      this.setAllFlagsToTrue();
    } else {
      this.filesSorter.setCustomIdentifier(id);
      this.flagFiles();
    }
  }

  onFileSelect(event, scanType: string) {
    if (event.target.files.length > 0) {
      const files = event.target.files;
      if (this.fileFilter(files)) {
        this.uploadForm.get(scanType).setValue(Array.from(files));
        this.flagFiles();
      }
    }
  }

  fileFilter(files: File[]): boolean {
    for (const file of files) {
      if (!(this.supportedFileTypes.includes(file.type))) {
        window.alert("Die Datei " + file.name + " besitzt ein nicht unterstütztes Dateiformat. " +
          "Bitte nur PNG oder JPEG hochladen.");
        return false;
      }
    }
    return true;
  }

  flagFiles(): void {
    const mainFiles: File[] = this.uploadForm.get("mainScans").value;
    const lateralFiles: File[] = this.uploadForm.get("lateralScans").value;
    const preFiles: File[] = this.uploadForm.get("preScans").value;

    this.mainFlags = this.filesSorter.identifierSearch(mainFiles);
    this.lateralRedFlags = this.filesSorter.identifierSearch(lateralFiles);
    this.preRedFlags = this.filesSorter.identifierSearch(preFiles);

    this.lateralYellowFlags = this.filesSorter.fileMatchSearch(mainFiles, lateralFiles);
    this.preYellowFlags = this.filesSorter.fileMatchSearch(mainFiles, preFiles);
  }

  setAllFlagsToTrue(): void {
    for (let i = 0; i < this.mainFlags.length; i++) {
      this.mainFlags[i] = true;
    }
    for (let i = 0; i < this.lateralRedFlags.length; i++) {
      this.lateralRedFlags[i] = true;
      this.lateralYellowFlags[i] = true;
    }
    for (let i = 0; i < this.preRedFlags.length; i++) {
      this.preRedFlags[i] = true;
      this.preYellowFlags[i] = true;
    }
  }

  onSubmit(): void {
    this.uploading = true;
    let choice = true;
    if (this.mainFlags.includes(false) || this.lateralYellowFlags.includes(false) || this.lateralRedFlags.includes(false)
    || this.preYellowFlags.includes(false) || this.preRedFlags.includes(false)) {
      choice = window.confirm("Eine oder mehre Dateien konnten nicht korrekt zugeordnet werden. " +
        "Diese werden beim Upload ignoriert. Sind Sie sicher, dass Sie fortfahren möchten?");
    }

    if (choice) {
      const mainScans = this.uploadForm.get("mainScans").value;
      const lateralScans = this.uploadForm.get("lateralScans").value;
      const preScans = this.uploadForm.get("preScans").value;

      const fileTuples: [File, File, File][] = this.filesSorter.getFileTuples(mainScans, lateralScans, preScans);

      for (const fileTuple of fileTuples) {
        const formData = new FormData();
        const id = nanoid();
        formData.append("modality", "xray");
        formData.append("id", id);
        console.log(this.uploadForm.value.deepDocTemplate);
        console.log(this.uploadForm.value.shallowDocTemplate);
        formData.append("deepDocTemplate", JSON.stringify(this.uploadForm.value.deepDocTemplate));
        formData.append("shallowDocTemplate", JSON.stringify(this.uploadForm.value.shallowDocTemplate));
        formData.append("mainScan", fileTuple[0]);
        formData.append("lateralScan", fileTuple[1]);
        formData.append("preScan", fileTuple[2]);

        this.backendCaller.addMaterial(formData).subscribe( result => {
          this.progress += 100/(fileTuples.length);
          if (result.success === false || result.success === undefined) {
            this.messages.push(id + ": " + result.message);
          }
          if (fileTuples.indexOf(fileTuple) === fileTuples.length - 1 && this.messages.length === 0) {
            setTimeout(() => this.close(), 1000);
          }
        }, err => {
          this.progress += 100/(fileTuples.length);
          this.messages.push(id + ": " + err);
          console.log(err);
          if (fileTuples.indexOf(fileTuple) === fileTuples.length - 1 && this.messages.length === 0) {
            setTimeout(() => this.close(), 10000);
          }
        });
      }
    } else {
      this.uploading = false;
    }

  }

  close() {
    this.dialogRef.close();
  }

}

import {Component, OnInit} from "@angular/core";
import {MatLegacyDialog as MatDialog} from "@angular/material/legacy-dialog";
import {Router} from "@angular/router";
import {AuthenticationService, BackendCallerService, MatDialogService, RadiolearnService} from "@app/core";
import {Material, Role, User} from "@app/models";
import {ConfirmDialogComponent, ConfirmDialogModel, UploadMaterialComponent} from "@app/shared";
import {AddScanDialogComponent} from "@app/shared/add-scan-dialog/add-scan-dialog.component";

import {environment} from "@env/environment";

@Component({
  selector: "app-display-material",
  templateUrl: "./radiolearn-list.component.html",
  styleUrls: ["./radiolearn-list.component.scss"]
})
export class RadiolearnListComponent implements OnInit {

  imageUrl = environment.images;
  materials: Material[] = [];

  shallowTemplates: string[] = [];
  deepTemplates: string[] = [];
  shallowFilter: string;
  deepFilter: string;

  showJudged = false;

  collectionSize = 0;
  pageSize = 10;
  page = 1;

  private user: User;

  constructor(private backendCaller: BackendCallerService,
              private router: Router,
              private dialogService: MatDialogService,
              private dialog: MatDialog,
              private authenticationService: AuthenticationService,
              private radiolearnService: RadiolearnService) { }

  get isMod() {
    return this.user && (this.user.role === Role.Admin || this.user.role === Role.Moderator);
  }

  get isAdmin() {
    return this.user && (this.user.role === Role.Admin);
  }

  async ngOnInit() {
    await this.authenticationService.user.subscribe((x) => {
      this.user = x;
      this.showJudged = !this.isMod;
    });
    this.getCountAndData();
    this.getTemplateLists();
  }

  getTemplateLists() {
    this.backendCaller.getTemplateListAsString("shallowDoc").subscribe(res => {
      console.log(res);
      this.shallowTemplates = res.templateNames;
    });
    this.backendCaller.getTemplateListAsString("deepDoc").subscribe(res => {
      console.log(res);
      this.deepTemplates = res.templateNames;
    });
  }

  getCountAndData() {
    this.backendCaller.getDocCount(this.showJudged, this.shallowFilter).subscribe(res => {
      console.log("Count: ", res.count);
      console.log(this.collectionSize);
      this.collectionSize = res.count;
      this.page = 1;
      this.getData();
    }, err => {
      console.log(err);
      window.alert(err.message);
    });
  }

  getData(reverse = true) {
    if (reverse) {
      // for reverse: skip number is total docCount - pageSize * current page
      let skip = this.collectionSize - this.page * this.pageSize;
      let length = this.pageSize;
      if (skip < 0) {
        length = length + skip;
        skip = 0;
      }
      this.backendCaller.listByFilter(skip, length, this.showJudged, this.shallowFilter)
        .subscribe(res => {
          // then reverse the resulting template-list
          this.materials = res.materials.reverse();
        }, err => {
          window.alert(err.message);
        });
    } else {
      const skip = (this.page - 1) * this.pageSize;
      this.backendCaller.listByFilter(skip, this.pageSize, this.showJudged, this.shallowFilter)
        .subscribe(res => {
          this.materials = res.materials;
        }, err => {
          window.alert(err.message);
        });
    }
  }

  delete(objectID: string, scanID: string) {
    const dialogData = new ConfirmDialogModel(
      "warning",
      "Entfernen bestätigen",
      "Möchten Sie diesen Eintrag wirklich entfernen?");

    const dialogConfig = this.dialogService.defaultConfig("400px", dialogData);
    dialogConfig.position = { top: "50px" };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.backendCaller.deleteMaterial(objectID, scanID).subscribe(res => {
          console.log(res.message);
          this.getCountAndData();
        }, err => {
          console.log(err);
        });
      }
    });
  }

  deleteScan(objectID: string, scanID: string, scanType: string, filename: string) {
    const dialogData = new ConfirmDialogModel(
      "warning",
      "Entfernen bestätigen",
      "Möchten Sie diese Aufnahme wirklich entfernen?");

    const dialogConfig = this.dialogService.defaultConfig("400px", dialogData);
    dialogConfig.position = { top: "50px" };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.backendCaller.deleteScanById(objectID, scanID, scanType, filename).subscribe(res => {
          console.log(res.message);
          this.getCountAndData();
        }, err => {
          console.log(err);
        });
      }
    });
  }

  openEditor(matID: string) {
    this.radiolearnService.workMode = "deep";
    this.router.navigate(["/", "radiolearn", "main", matID]).then();
  }

  openUploadDialog() {
    const dialogConfig = this.dialogService.defaultConfig("600px");
    const dialogRef = this.dialog.open(UploadMaterialComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(() => {
      this.getCountAndData();
    });
  }

  openAddScanDialog(id: string, dirID: string, scanType: string) {
    const dialogConfig = this.dialogService.defaultConfig("600px",
      {
        id,
        scanType,
        dirID
      });
    const dialogRef = this.dialog.open(AddScanDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(() => {
      this.getCountAndData();
    });
  }

  displayDate(timestamp: number): string {
    if (typeof(timestamp) === "number") {
      const date = new Date(timestamp);
      return date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
    } else {
      return "N/A";
    }
  }

  updateTemplates() {
    let message: string;
    let type: string;

    if (this.showJudged) {
      type = "warning";
      message = "Möchten Sie alle veralteten Aufnahmen der bearbeiteten Scans aktualisieren? " +
        "Dabei gehen alle Einträge, die älter als die aktuelle Standardschablone sind, verloren.";
    } else {
      type = "confirm";
      message = "Möchten Sie alle veralteten Aufnahmen der nicht bearbeiteten Scans aktualisieren?";
    }

    const dialogData = new ConfirmDialogModel(
      type,
      "Schablonen aktualisieren",
      message);

    const dialogConfig = this.dialogService.defaultConfig("400px", dialogData);
    dialogConfig.position = { top: "50px" };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.backendCaller.updateMatTemplate(this.showJudged).subscribe(res => {
          window.alert(res.message);
          console.log(res);
          this.getCountAndData();
        }, err => {
          console.log(err);
          window.alert(err.message);
        });
      }
    });
  }

  updateMatTempBCById(id: string) {

    const dialogData = new ConfirmDialogModel(
      "confirm",
      "Schablone aktualisieren",
      "Möchten Sie die Schablone dieser Aufnahme aktualisieren? Es können dabei Einträge verloren gehen.");

    const dialogConfig = this.dialogService.defaultConfig("400px", dialogData);
    dialogConfig.position = { top: "50px" };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.backendCaller.updateMatTemplateBCByID(id).subscribe(res => {
          console.log(res);
          window.alert(res);
        }, err => {
          console.log(err);
        });
      }
    });
  }

}

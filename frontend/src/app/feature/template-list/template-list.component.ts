import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

import {BackendCallerService, MatDialogService, AuthenticationService} from "@app/core";
import {Template} from "@app/models";
import { ConfirmDialogComponent, ConfirmDialogModel, UploadTemplateComponent } from "@app/shared";
import {Role, User} from "@app/models";


@Component({
  selector: "app-template-list",
  templateUrl: "./template-list.component.html",
  styleUrls: ["./template-list.component.scss"]
})
export class TemplateListComponent implements OnInit {

  templates: Template[] = [];
  isLoading: boolean;

  // TODO: implement outside of source code
  blacklist = ["Radiolearn", "Zwei-Ebenen-Thorax", "Intensivlunge"];

  private user: User;

  constructor(private dialog: MatDialog,
              private backendCaller: BackendCallerService,
              private dialogService: MatDialogService,
              private authenticationService: AuthenticationService
  ) { }

  get isMod() {
    return this.user && (this.user.role === Role.Admin || this.user.role === Role.Moderator);
  }

  get isAdmin() {
    return this.user && this.user.role === Role.Admin;
  }

  ngOnInit() {
    this.authenticationService.user.subscribe(x => this.user = x);
    this.isLoading = true;
    this.update();
  }

  update(): void {
    this.backendCaller.getTemplateList().subscribe((templates) => {
      this.templates = templates;
      this.isLoading = false;
    });
  }

  removeAlert(id: string, name: string) {
    const dialogData = new ConfirmDialogModel(
      "warning",
      "Entfernen bestätigen",
      "Möchten Sie die Schablone '" + name + "' wirklich entfernen?");

    const dialogConfig = this.dialogService.defaultConfig("400px", dialogData);
    dialogConfig.position = { top: "50px" };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.remove(id);
      }
    });
  }

  remove(id: string): void {
    this.backendCaller.deleteTemplate(id).subscribe(res => {
      this.update();
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

  displayKind(kind: string): string {
    if (kind === undefined || kind === null) {
      return "N/A";
    }
    if (kind === "deepDoc") {
      return "Dokumentation";
    }
    if (kind === "shallowDoc") {
      return "Diagnose";
    }
  }

  openUploadDialog() {
    const dialogConfig = this.dialogService.defaultConfig("470px");
    const dialogRef = this.dialog.open(UploadTemplateComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(() => {
      this.update();
    });
  }
}

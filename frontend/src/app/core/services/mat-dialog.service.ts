import { Injectable } from "@angular/core";
import {MatLegacyDialogConfig as MatDialogConfig} from "@angular/material/legacy-dialog";
import {ConfirmDialogModel} from "@app/shared";

@Injectable({
  providedIn: "root"
})
export class MatDialogService {

  constructor() { }

  defaultConfig(width?: string, data?): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;

    if(width !== undefined) {
      dialogConfig.width = width;
    }

    if(data !== undefined) {
      dialogConfig.data = data;
    }

    return dialogConfig;
  }
}

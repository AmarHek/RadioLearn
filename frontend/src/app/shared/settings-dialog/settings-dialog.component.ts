import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {SettingsService} from "@app/core/services/settings.service";

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.css']
})
export class SettingsDialogComponent implements OnInit {

  color_mode?: string = "standard"
  language?: string = "german"

  constructor(private dialogRef: MatDialogRef<SettingsDialogComponent>,
              private settingsService: SettingsService) {
  }

  ngOnInit(): void {
    this.load_settings()
  }

  load_settings() {
    this.color_mode = this.settingsService.getSetting(this.settingsService.Settings.ColorTheme.ID)
    this.language = this.settingsService.getSetting(this.settingsService.Settings.Language.ID)
  }

  save_settings() {
    this.settingsService.setSetting(this.settingsService.Settings.ColorTheme.ID, this.color_mode)
    this.settingsService.setSetting(this.settingsService.Settings.Language.ID, this.language)
    this.dialogRef.close();
  }

  close_dialog() {
    this.dialogRef.close()
  }


}

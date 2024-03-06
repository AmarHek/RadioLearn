import { Component, OnInit } from "@angular/core";
import {BackendCallerService, MatDialogService} from "@app/core";
import {Feedback} from "@app/models";
import {getDateFormatted} from "@app/helpers";
import {ConfirmDialogComponent, ConfirmDialogModel} from "@app/shared";
import {MatLegacyDialog as MatDialog} from "@angular/material/legacy-dialog";

@Component({
  selector: "app-feedback-display",
  templateUrl: "./feedback-display.component.html",
  styleUrls: ["./feedback-display.component.css"]
})
export class FeedbackDisplayComponent implements OnInit {

  collectionSize = 0;
  pageSize = 10;
  page = 1;

  feedbackList: Feedback[];

  constructor(
    private backendCaller: BackendCallerService,
    private dialogService: MatDialogService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadData().then();
  }

  async loadData() {
    await this.getLength();
    this.getData();
  }

  getData() {
    this.backendCaller.getFeedbackList((this.page - 1) * this.pageSize, this.pageSize)
      .subscribe(res => {
        this.feedbackList = res.feedbackList;
      }, err => {
        console.log(err.message);
      });
  }

  getLength() {
    this.backendCaller.getFeedbackCount().subscribe(res => {
      this.collectionSize = res.count;
    }, err => {
      console.log(err);
    });
  }

  deleteFeedback(id: string) {
    const dialogData = new ConfirmDialogModel(
      "warning",
      "Entfernen bestätigen",
      "Möchten Sie diesen Eintrag wirklich entfernen?");

    const dialogConfig = this.dialogService.defaultConfig("400px", dialogData);
    dialogConfig.position = { top: "50px" };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.backendCaller.deleteFeedback(id).subscribe(res => {
          console.log(res);
          this.getData();
        });
      }
    });
  }

  formatDate(dateString: string) {
    const date = new Date(dateString);
    return getDateFormatted(date, false);
  }


}

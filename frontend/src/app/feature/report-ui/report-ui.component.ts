import {ActivatedRoute} from "@angular/router";
import {Category, Role, Template, User} from "@app/models";
import {ChipHelperService} from "@app/core/services/chip-helper.service";
import {Component, ElementRef, HostListener, Inject, OnInit, ViewChild} from "@angular/core";
import {ComponentCanDeactivate} from "@app/guards/pending-changes.guard";
import {DomSanitizer} from "@angular/platform-browser";
import {HttpClient} from "@angular/common/http";
import {Location} from "@angular/common";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {Observable} from "rxjs";
import {ReportOptionsComponent} from "@app/shared";
import {
  AuthenticationService,
  BackendCallerService,
  DataParserService,
  InputParserService
} from "@app/core";
import {InputMaterialHandlerComponent} from "@app/feature/input-material-handler/input-material-handler.component";

interface Layout {
  id: number;
  displayName: string;
}

export interface DialogData {
  id: string;
}

@Component({
  selector: "app-dialog-overview-example-dialog-component",
  templateUrl: "./app-dialog-overview-example-dialog-component.html",
})

export class DialogOverviewExampleDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
  }
}

@Component({
  selector: "app-report-ui",
  templateUrl: "./report-ui.component.html",
  styleUrls: ["./report-ui.component.scss"],
})

export class ReportUiComponent implements OnInit, ComponentCanDeactivate {

  @ViewChild("chipInput") chipInput: ElementRef<HTMLInputElement> | undefined;
  @ViewChild(InputMaterialHandlerComponent) private inputMaterialHandlerComponent: InputMaterialHandlerComponent;
  @ViewChild(ReportOptionsComponent) private optionsComponent: ReportOptionsComponent;

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return this.sessionData.length <= this.savedSessionData;
  }

  // Constants
  layouts: Layout[] = [
    {id: 0, displayName: "Standard Layout"},
    {id: 1, displayName: "Kategorien aufklappen"}
  ];

  // UI related
  selectedCat = "undefined";
  selectedSelectableID = "";
  currentLayout = this.layouts[1];

  // Model
  categories: Category[];
  defaultCategories: Category[];
  report = "";
  judgement = "";

  //Data collection
  timestampStart: number;
  imageID: string;
  mode: string;
  template: Template = undefined;
  timerStarted = false;
  sessionData = [];
  savedSessionData = 0;

  private user: User;

  get isTester() {
    return this.user && (this.user.role === Role.Admin || this.user.role === Role.tester);
  }

  get isAdmin() {
    return this.user && this.user.role === Role.Admin;
  }

  constructor(private http: HttpClient,
              private route: ActivatedRoute,
              private dataParser: DataParserService,
              private _location: Location,
              private inputParser: InputParserService,
              private chipHelper: ChipHelperService,
              private backendCaller: BackendCallerService,
              private sanitizer: DomSanitizer,
              public dialog: MatDialog,
              private authenticationService: AuthenticationService
  ) {
  }

  // INITIALIZATION
  ngOnInit() {
    this.authenticationService.user.subscribe(x => this.user = x);
    this.getData();
  }

  // gets parts from node server via id in url
  getData() {
    this.route.paramMap.subscribe(ps => {
      if (!ps.has("id")) return;
      const templateID = ps.get("id");
      this.backendCaller.getTemplateById(templateID).subscribe((template: Template) => {
        if (template === undefined) {
          window.alert("Dieses Dictionary existiert nicht! " +
            "Bitte auf List Seite zurückkehren und eines der dort aufgeführten Dictionaries auswählen.");
          return;
        }
        // prepare data
        this.template = template;
        this.categories = this.dataParser.extractCategories(template.parts);
        this.defaultCategories = JSON.parse(JSON.stringify(this.categories));
        this.inputParser.init(this.categories);
        // prepare UI
        this.selectedCat = this.categories[0].name;
      });
    });
  }

  // UI / GENERAL
  layoutChanged(newLayout: Layout) {
    this.selectedCat = this.categories[0].name;
    this.currentLayout = newLayout;
  }

  // DATA
  onCategorySelected(cat: string) {
    this.inputMaterialHandlerComponent.focusInput()
    this.selectedCat = cat;
    this.selectedSelectableID = "";
  }

  updateText(): void {
    [this.report, this.judgement] = this.dataParser.makeText(this.template.parts, this.categories);
  }

  resetText(): void {
    this.report = "";
    this.judgement = "";
  }

  // Chip was selected, navigate to corresponding category and highlight selected element
  chipSelectedEvent([selectedCat, selectedSelectableID]) {
    this.selectedCat = selectedCat;
    this.selectedSelectableID = selectedSelectableID;
  }

  inputEvent() {
    setTimeout(() => this.updateText(), 5);
  }

  // resets categories, and re-initializes the options rows, with the new array reference
  resetMaterial() {
    this.categories = JSON.parse(JSON.stringify(this.defaultCategories));
    setTimeout(() => this.optionsComponent.initRows(this.categories), 5);
  }

  // Used to reset the material if part of the input is removed (since assign values can't
  // remove values from a material, a clean reset is necessary, before onInput is called,
  // and the new values are parsed from the now shorter input and then applied to the material)
  resetMaterialKeepInput() {
    this.resetMaterial()
    this.selectedSelectableID = ""
    setTimeout(() => this.inputMaterialHandlerComponent.onInput(), 5);
  }

  resetAll() {
    this.resetMaterial()
    setTimeout(() => this.resetText(), 5);
    setTimeout(() => this.inputMaterialHandlerComponent.reset())
  }

  // Values in the material changed, update chips and text to reflect the changes
  materialChanged() {
    setTimeout(() => this.updateText(), 5);
    setTimeout(() => this.inputMaterialHandlerComponent.generateChips(), 5);
  }

  // Any element in the options component was clicked, reset focus to input line,
  // reset element highlighting, update text and input chips
  updateFromOptionsEvent() {
    this.inputMaterialHandlerComponent.focusInput()
    this.selectedSelectableID = "";
    this.materialChanged()
  }

  // make material normal, update text and input chips
  makeNormal() {
    this.dataParser.makeNormal(this.categories);
    this.materialChanged()
  }

  // Todo, overhaul data-collection
  // DATA COLLECTION BELOW
  submit() {
    const pseudonym = this.pseudonym;
    const duration = Date.now() - this.timestampStart;

    this.sessionData.push({
      template: this.template,
      timestampStart: this.timestampStart,
      duration,
      imageID: this.imageID,
      currentLayout: this.currentLayout.id,
      mode: this.mode,
      report: this.report + "\nJudgement below:\n" + this.judgement,
      pseudonym
    });

    this.backendCaller.addDoctorReport(
      this.template,
      this.timestampStart,
      duration,
      this.imageID,
      this.currentLayout.id,
      this.mode,
      this.report + "\nJudgement below:\n" + this.judgement,
      pseudonym
    ).subscribe(res => console.log(res.message));
  }

  get pseudonym() {
    const extendedUsername = "user-" + this.user.username;
    return extendedUsername.split("").map(v => v.charCodeAt(0)).reduce(
      (a, v) => a + ((a << 7) + (a << 3)) ^ v).toString(16);
  }

  get dataFilename() {
    return this.user.username + "_" + (new Date().toLocaleString()) + ".json";
  }

  get downJson() {
    // auxiliary function to get parsed json (mostly because of missing Excel parser in node)
    const jsonData = JSON.stringify(this.sessionData);
    const uri = "data:text/json;charset=UTF-8," + encodeURIComponent(jsonData);
    return this.sanitizer.bypassSecurityTrustUrl(uri);
  }

  startReportClicked() {
    this.openDialog();
    this.resetAll();
    this.updateText();
  }

  submitReportClicked() {
    this.timerStarted = false;
    this.submit();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogOverviewExampleDialogComponent, {
      width: "350px",
      data: {id: ""}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.mode = result.split("$")[1];
      this.imageID = result.split("$")[0];
      console.log("mode:" + this.mode);
      console.log("id:" + this.imageID);
      this.timerStarted = true;
      this.timestampStart = Date.now();
    });
  }

  updateSessionData(event) {
    console.log(event);
  }
}

import * as M from "@app/core/models/templateModel";
import {ActivatedRoute, Router} from "@angular/router";
import {BoxLabel, Material, Role, Template, User} from "@app/core/models";
import {CategoryError} from "@app/core/models/errorModel";
import {ChipHelperService} from "@app/core/services/chip-helper.service";
import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {DialogNoMaterialsComponent} from "@app/shared/dialog-no-materials/dialog-no-materials.component";
import {DialogTemplateComponent} from "@app/shared/dialog-template/dialog-template.component";
import {MatDialog} from "@angular/material/dialog";
import {getResetCounter, getSurveyStatus, getUUID, increaseSurveyCounter} from "@app/core/helpers/localStorageHelper";
import {
  FeedbackDialogComponent,
  SettingsDialogComponent
} from "@app/shared";
import {
  AuthenticationService,
  BackendService,
  DataParserService, DisplayService,
  InputParserService,
  MatDialogService,
  RadiolearnService
} from "@app/core";
import {ImageAnnotatorComponent,
  ImageDisplayComponent,
  OptionsComponent,
  StudentErrorsComponent,
  InputHandlerComponent} from "@app/main-interface";

@Component({
  selector: "app-main-interface",
  templateUrl: "./main-interface.component.html",
  styleUrls: ["./main-interface.component.scss"],
})
export class MainInterfaceComponent implements OnInit {

  @ViewChild(OptionsComponent) radiolearnOptionsChild: OptionsComponent;
  @ViewChild(ImageDisplayComponent) imageDisplayStudentChild: ImageDisplayComponent;
  @ViewChild(ImageAnnotatorComponent) imageDisplayChild: ImageAnnotatorComponent;
  @ViewChild(InputHandlerComponent) private inputMaterialHandlerComponent: InputHandlerComponent;
  @ViewChild("chipInput") chipInput: ElementRef<HTMLInputElement> | undefined;


  // data variables
  material: Material;
  template: Template = undefined;
  ogTemplate: Template;
  emptyTemplate: Template;
  categories: M.Category[];
  defaultCategories: M.Category[];

  boxLabels: BoxLabel[];
  errors: CategoryError[];

  // variables for options/category UI
  selectedCat: string;
  selectedSelectableID = "";
  inputEnabled: boolean = false;
  drawMode: boolean = true;

  // state variables
  userMode: boolean;
  workMode: string; // "deep" or "shallow"
  isMobile = false;
  anyComments = false;

  // evaluation
  SAVE_EVALUATION_DATA = true
  timestamp: number;
  sawFeedback = false;

  SHOW_SURVEY = true
  showSurveyEveryNMaterials = 10;

  private uuid = "undefined";

  private user: User;

  get isMod() {
    return this.user && (this.user.role === Role.Admin || this.user.role === Role.Moderator);
  }

  get isAdmin() {
    return this.user && this.user.role === Role.Admin;
  }

  get deepMode() {
    return (this.workMode === "deep");
  }

  constructor(private backendCaller: BackendService,
              private route: ActivatedRoute,
              private router: Router,
              private dataParser: DataParserService,
              private authenticationService: AuthenticationService,
              private displayService: DisplayService,
              private radiolearnService: RadiolearnService,
              private chipHelper: ChipHelperService,
              private inputParser: InputParserService,
              private dialog: MatDialog,
              private dialogService: MatDialogService) {
  }


  // INITIALIZATION
  ngOnInit() {
    // Mod or regular user?
    this.authenticationService.user.subscribe(
      (x) => {
        this.user = x;
        this.userMode = !this.isMod;
      });

    // mobile check
    this.displayService.isMobile.subscribe(res => {
      this.isMobile = res;
    });

    // get current mode
    this.setWorkMode();

    // get actual data
    this.getData().then();

    // data collection
    this.uuid = getUUID();
    if (this.SAVE_EVALUATION_DATA){
      this.timestamp = Date.now();
    }
  }

  async getData() {
    this.route.paramMap.subscribe(async (ps) => {
      if (!ps.has("id")) return;
      this.backendCaller.getMaterialById(ps.get("id")).subscribe({
        next: (res) => {
          if (res.material === undefined) {
            window.alert("Der Eintrag mit dieser ID existiert nicht! " +
              "Bitte zur Aufnahmen-Liste zurückkehren und eine der dort aufgeführten Aufnahmen auswählen.");
            return;
          }
          this.setWorkMode()
          this.initFields(res.material)
          if (this.SHOW_SURVEY) {
            this.initSurvey()
          }
        },
        error: (err) => {
          window.alert(err.message);
        }
      })
    });
  }

  initFields(material){
    this.material = material;
    // Template to be worked on
    this.template = this.workMode === "deep" ? this.material.deepDocTemplate : this.material.shallowDocTemplate;
    // Original Template to be compared against for error check
    this.ogTemplate = JSON.parse(JSON.stringify(this.template));
    // Empty Template to be compared against for chip generation
    this.emptyTemplate = this.radiolearnService.resetTemplate(JSON.parse(JSON.stringify(this.template)));

    if (!this.isMod) {
      this.template = this.radiolearnService.resetTemplate(this.template);
    }

    this.categories = this.dataParser.extractCategories(this.template.parts);
    this.defaultCategories = JSON.parse(JSON.stringify(this.categories));
    this.inputParser.init(this.categories);
    this.selectedCat = this.categories[0].name;
    // Do this so radiolearn report-output-options don't break on route change
    if (this.radiolearnOptionsChild !== undefined) {
      this.radiolearnOptionsChild.categories = this.categories;
    }
    this.boxLabels = this.radiolearnService.getBoxLabels(this.material.shallowDocTemplate.parts[0] as M.Category);
    this.sawFeedback = false;

    //check if there are any comments in the annotations, to enable the "view comment" button
    this.anyComments = this.dataParser.materialHasComments(this.material);
  }

  initSurvey(){
    this.timestamp = Date.now();
    const surveyStatus = getSurveyStatus();
    if (surveyStatus > 0 && surveyStatus % this.showSurveyEveryNMaterials === 0) {
      this.openSurveyDialog();
    }
  }

  setWorkMode() {
    if (this.radiolearnService.workMode !== undefined) {
      // try service first: if coming from radiolearn welcome, radiolearnService.workMode should not be undefined
      this.workMode = this.radiolearnService.workMode;
      this.drawMode = this.radiolearnService.drawMode;
      // add to localStorage afterward
      localStorage.setItem("workMode", this.workMode);
      localStorage.setItem("drawMode", JSON.stringify(this.drawMode))
    } else {
      // if here from reloading, try localStorage
      const workMode = localStorage.getItem("workMode");
      const value = localStorage.getItem("drawMode");
      this.drawMode = value ? JSON.parse(value) : false;
      if (workMode !== null) {
        this.workMode = workMode;
      } else {
        // default behaviour, if all else fails
        this.workMode = "deep";
      }
    }
  }

  // UI / GENERAL
  switchInputMode() {
    this.inputEnabled = !this.inputEnabled;
  }

  back() {
    if (this.isMod) {
      this.router.navigate(["material-list"]).then();
    } else {
      this.router.navigate(["/"]).then();
    }
  }

  openNoMaterialsLeftDialog(): void {
    this.dialog.open(DialogNoMaterialsComponent);
  }

  toggleUserMode() {
    this.userMode = !this.userMode;
  }

  switchMode() {
    this.workMode = this.workMode === "deep" ? "shallow" : "deep";
    localStorage.setItem("workMode", this.workMode);
    this.reset();
    this.ngOnInit()
  }

  // DATA
  nextCategory(nextCat: string) {
    this.selectedCat = nextCat;
  }

  onCategorySelected(cat: string) {
    this.selectedCat = cat;
  }

  nextMaterial() {
    if (this.userMode) {
      this.nextMaterialStudent();
    } else {
      if (window.confirm("Nicht gespeicherte Daten gehen verloren. Trotzdem nächste Aufnahme laden?")) {
        this.nextMaterialToAnnotate();
      }
    }
  }

  nextMaterialStudent() {
    console.info("getting next material for " + this.uuid)
    this.imageDisplayStudentChild.displayBoxesSolution = false
    this.backendCaller.getUnusedMaterial(this.uuid, this.workMode, getResetCounter()).subscribe({
      next: (res) => {
        if (res.material === null) {
          this.openNoMaterialsLeftDialog();
        } else {
          // if (this.imageDisplayStudentChild.displayBoxes) {
          //   this.imageDisplayStudentChild.toggleBoxes();
          // }
          this.sawFeedback = false;
          increaseSurveyCounter();
          this.router.navigate(["/", "main", res.material._id]).then();
        }
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  nextMaterialToAnnotate() {
    if (this.imageDisplayChild.displayBoxes) {
      this.imageDisplayChild.toggleBoxes();
    }
    this.backendCaller.getRandom(false).subscribe({
      next: (res) => {
        console.log(res);
        if (res.material === null) {
          window.alert("Keine weiteren Befunde verfügbar");
        } else {
          this.router.navigate(["/", "main", res.material._id]).then();
        }
      },
      error: (err) => {
        window.alert(err);
        console.log(err);
      }
    })
  }

  save() {
    this.radiolearnService.fillShallowTemplateByBoxAnnotations(this.material.shallowDocTemplate,
      this.material.annotations);
    this.backendCaller.updateMaterial(this.material).subscribe(res => {
      window.alert(res.message);
      this.nextMaterialToAnnotate();
    });
  }

  checkForErrors() {
    if (this.drawMode && !this.sawFeedback){
      this.sawFeedback = true
      this.submit();
      this.imageDisplayStudentChild.checkBoxes()
      return
    }
    if (!this.sawFeedback) {
      this.submit();
      this.errors = this.radiolearnService.compareTemplates(this.ogTemplate, this.template)
      this.imageDisplayStudentChild.toggleBoxes();
    }

    // state variable
    this.sawFeedback = true;

    // Modal Dialog here, then await confirm press for next
    const errors = this.errors;
    const dialogConfig = this.dialogService.defaultConfig("1100px", {errors});
    const dialogRef = this.dialog.open(StudentErrorsComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.nextMaterial();
      }
    });
  }

  // Used to reset the material if part of the input is removed (since assign values can't
  // remove values from a material, a clean reset is necessary, before onInput is called,
  // and the new values are parsed from the now shorter input and then applied to the material)
  resetMaterialKeepInput() {
    this.resetMaterial()
    this.selectedSelectableID = ""
    setTimeout(() => this.inputMaterialHandlerComponent.onInput(), 5);
  }

  resetMaterial() {
    this.categories = JSON.parse(JSON.stringify(this.defaultCategories));
  }

  // Chip was selected, navigate to corresponding category and highlight selected element
  chipSelectedEvent([selectedCat, selectedSelectableID]) {
    this.selectedCat = selectedCat;
    this.selectedSelectableID = selectedSelectableID;
  }

  reset(resetUI: boolean = true) {
    if (resetUI) {
      this.selectedCat = this.categories[0].name;
      this.selectedSelectableID = "";
    }
    this.template = JSON.parse(JSON.stringify(this.emptyTemplate));
    this.categories = this.dataParser.extractCategories((this.template.parts))
  }

  // Any element in the options component was clicked, reset focus to input line,
  // reset element highlighting, update input chips
  updateFromOptionsEvent() {
    this.inputMaterialHandlerComponent.focusInput()
    this.selectedSelectableID = "";
    this.materialChanged()
  }

  // Vales in the material changed, update chips to reflect changes
  materialChanged() {
    setTimeout(() => this.inputMaterialHandlerComponent.generateChips(), 5);
  }

  makeNormal() {
    this.dataParser.makeNormal(this.categories);
    this.materialChanged()
  }

  openSettingsMenu(){
    this.dialog.open(SettingsDialogComponent)
  }

  navigateToDeepMode() {
    this.radiolearnService.drawMode = false;
    this.radiolearnService.workMode = "deep";
    this.loadUnused("deep");
  }

  navigateToShallowMode() {
    this.radiolearnService.drawMode = false;
    this.radiolearnService.workMode = "shallow";
    this.loadUnused("shallow");
  }

  navigateToDrawMode() {
    this.radiolearnService.drawMode = true;
    this.radiolearnService.workMode = "shallow";
    this.loadUnused("shallow");
  }

  loadUnused(mode: string){
    this.backendCaller.getUnusedMaterial(this.uuid, mode, getResetCounter()).subscribe(res => {
      console.log(res);
      if (res.material === null) {
        this.dialog.open(DialogNoMaterialsComponent)
      } else {
        this.router.navigate(["/", "radiolearn", "main", res.material._id]);
      }
    }, err => {
      console.log(err);
    });
  }

  // EVALUATION / DATA COLLECTION
  submit() {
    if (!this.SAVE_EVALUATION_DATA) return

    let workMode = this.workMode
    let boxes = null

    if (this.drawMode) {
      workMode = "draw"
      boxes = this.imageDisplayStudentChild.getStudentBoxes()
    }

    const duration = Date.now() - this.timestamp;
    this.backendCaller.addRadiolearnData(
      this.uuid,
      this.material._id,
      this.template,
      this.ogTemplate,
      workMode,
      this.timestamp,
      duration,
      getResetCounter(),
      boxes
    ).subscribe(res => {
      console.log(res.message);
    });
  }

  openSurveyDialog(): void {
    this.dialog.open(DialogTemplateComponent);
  }

  feedbackModal() {
    const dialogConfig = this.dialogService.defaultConfig("700px", {
      userID: this.user.id,
      materialID: this.material._id
    });
    this.dialog.open(FeedbackDialogComponent, dialogConfig);
  }
}

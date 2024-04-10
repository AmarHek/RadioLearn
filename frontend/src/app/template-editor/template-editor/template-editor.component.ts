import {ActivatedRoute} from "@angular/router";
import {Category, CheckBox, Group, Option, Role, Template, User} from "@app/core/models";
import {Component, ElementRef, HostListener, OnInit, ViewChild} from "@angular/core";
import {ComponentCanDeactivate} from "@app/core/guards/pending-changes.guard";
import {MatDialog} from "@angular/material/dialog";
import {Observable} from "rxjs";
import {
  AuthenticationService,
  BackendService,
  DataParserService,
} from "@app/core";
import {DialogAddBoxComponent,
  DialogAddCategoryComponent,
  DialogAddGroupComponent,
  EditorOptionsComponent} from "@app/template-editor"
import {ConfirmDialogComponent} from "@app/shared";

@Component({
  selector: "app-template-editor",
  templateUrl: "./template-editor.component.html",
  styleUrls: ["./template-editor.component.scss"],
})

export class TemplateEditorComponent implements OnInit, ComponentCanDeactivate {

  @ViewChild("chipInput") chipInput: ElementRef<HTMLInputElement> | undefined;
  @ViewChild(EditorOptionsComponent) private optionsComponent: EditorOptionsComponent;

  @HostListener('window:beforeunload')

  canDeactivate(): Observable<boolean> | boolean {
    return this.sessionData.length <= this.savedSessionData;
  }

  // UI related
  selectedCat = "undefined";
  selectedSelectableID = "";

  // Model
  categories: Category[];
  defaultCategories: Category[];

  //Data collection
  template: Template = undefined;
  sessionData = [];
  savedSessionData = 0;

  private user: User;
  editStack = [];
  undoDepth = 0;

  get isTester() {
    return this.user && (this.user.role === Role.Admin || this.user.role === Role.tester);
  }

  get isAdmin() {
    return this.user && this.user.role === Role.Admin;
  }

  constructor(private route: ActivatedRoute,
              private dataParser: DataParserService,
              private backendCaller: BackendService,
              public dialog: MatDialog,
              private authenticationService: AuthenticationService
  ) {
  }

  // INITIALIZATION
  ngOnInit() {
    this.authenticationService.user.subscribe(x => this.user = x);
    this.getData();
  }

  edit(elementToEdit: CheckBox | Option) {
    if (elementToEdit.kind === "option") {
      this.editGroup(elementToEdit)
    }
    if (elementToEdit.kind === "box") {
      this.editCheckBox(elementToEdit)
    }
  }

  undoAvailable(){
    return this.undoDepth < this.editStack.length - 1;
  }

  redoAvailable(){
    return this.undoDepth > 0;
  }
  undo() {
    if (!this.undoAvailable()) {
      console.log("Undo triggered despite being unavailable.")
      return;
    }
    this.undoDepth += 1;
    // -1 because the last element is the current state
    this.categories = JSON.parse(JSON.stringify(this.editStack[this.editStack.length - this.undoDepth - 1]));
    this.optionsComponent.initRows(this.categories)
  }

  redo() {
    if (!this.redoAvailable()) {
      console.log("Redo triggered despite being unavailable.")
      return;
    }
    this.undoDepth -= 1;
    this.categories = JSON.parse(JSON.stringify(this.editStack[this.editStack.length - this.undoDepth - 1]));
    this.optionsComponent.initRows(this.categories)
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'z') {
      if (!this.undoAvailable()) return;
      this.undo()
    }
    else if (event.ctrlKey && event.key === 'y') {
      if (!this.redoAvailable()) return;
      this.redo()
    }
  }
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
        // prepare UI
        this.selectedCat = this.categories[0].name;
        this.updateUndoStack()
      });
    });
  }

  updateUndoStack() {
    if (this.undoDepth > 0) {
      // remove all elements after the current state, because we are branching off
      this.editStack.splice(-this.undoDepth)
      this.undoDepth = 0;
    }
    this.editStack.push(JSON.parse(JSON.stringify(this.categories)));
  }

  // DATA
  onCategorySelected(cat: string) {
    this.selectedCat = cat;
    this.selectedSelectableID = "";
  }

  // resets categories, and re-initializes the options rows, with the new array reference
  resetMaterial() {
    this.categories = JSON.parse(JSON.stringify(this.defaultCategories));
    setTimeout(() => this.optionsComponent.initRows(this.categories), 5);
  }


  addCategory() {
    let dialogData = {
      categoryNames: this.categories.map(cat => cat.name),
      categoryName: null
    };
    this.dialog.open(DialogAddCategoryComponent, {
      data: dialogData,
      width: '350px',
    }).afterClosed().subscribe(result => {
      if (result === undefined) return;
      let newCat: Category = {kind: "category", name: result, optional: false, selectables: []};
      this.categories.push(newCat);
      this.optionsComponent.initRows(this.categories)
      this.updateUndoStack()
    });
  }

  renameCategory(name: string) {
    let dialogData = {
      categoryNames: this.categories.map(cat => cat.name),
      categoryName: name
    };
    this.dialog.open(DialogAddCategoryComponent, {
      data: dialogData,
      width: '350px',
    }).afterClosed().subscribe(result => {
      if (result === undefined) return;
      this.categories.find(cat => cat.name === name).name = result;
      this.optionsComponent.initRows(this.categories)
      this.updateUndoStack()
    });
  }

  moveCategoryUp(name: string) {
    let index = this.categories.findIndex(cat => cat.name === name);
    if (index > 0) {
      let temp = this.categories[index];
      this.categories[index] = this.categories[index - 1];
      this.categories[index - 1] = temp;
      this.updateUndoStack()
    }
  }

  moveCategoryDown(name: string) {
    let index = this.categories.findIndex(cat => cat.name === name);
    if (index < this.categories.length - 1) {
      let temp = this.categories[index];
      this.categories[index] = this.categories[index + 1];
      this.categories[index + 1] = temp;
      this.updateUndoStack()
    }
  }

  removeCategory(name) {
    let index = this.categories.findIndex(cat => cat.name === name);
    this.categories.splice(index, 1);
    this.optionsComponent.initRows(this.categories)
    this.updateUndoStack()
  }


  // Creates a new unique group ID, based on the name of the first option in the group
  createNewGroupID(group: Group) : string{
    let groupIDS = [];
    this.categories.forEach(cat => {
      cat.selectables.forEach(sel => {
        if (sel.kind === 'group'){
          groupIDS.push(sel.name)
        }
      })
    })
    let i = 0;
    // take first 3 letters of first option (or less if it has less than three)
    let group_name = group.options[0].name.substring(0, Math.min(3, group.options[0].name.length))
    while (groupIDS.includes(group_name + i)){
      i++;
    }
    return group_name + i
  }

  // opens dialog to add group, assigns unique id to group once it has been created
  addGroup() {
    this.dialog.open(DialogAddGroupComponent, {
      width: '630px',
    }).afterClosed().subscribe(result => {
      if (result === undefined) return;
      let group: Group = result as Group
      group.name = this.createNewGroupID(group);
      this.categories.find(cat => cat.name === this.selectedCat).selectables.push(group);
      this.optionsComponent.initRows(this.categories)
      this.updateUndoStack()
    });
  }

  editGroup(option: Option) {
    // find corresponding group
    let group = this.categories.find(cat => cat.name === this.selectedCat).selectables.find(sel => sel.name === option.groupID) as Group;
    let dialogData = {
      groupToEdit: JSON.parse(JSON.stringify(group))
    };
    this.dialog.open(DialogAddGroupComponent, {
      width: '630px',
      data: dialogData
    }).afterClosed().subscribe(result => {
      if (result === undefined) return;
      // replace group with edited result
      let category = this.categories.find(cat => cat.name === this.selectedCat);
      let index = category.selectables.findIndex(sel => sel.name === group.name);
      category.selectables[index] = result;
      this.optionsComponent.initRows(this.categories)
      this.updateUndoStack()
    });

  }

  removeElement(elementToRemove: Option | CheckBox) {
    let message = `Soll die Checkbox "${elementToRemove.name}" wirklich gelöscht werden?`

    if (elementToRemove.kind == "option") {
      // get names of all options in group
      let group: Group = this.categories.find(cat => cat.name === this.selectedCat).selectables.find(sel => sel.name == elementToRemove.groupID) as Group
      let optionNames = group.options.map(option => option.name)
      message = 'Soll die gesamte Gruppe (' + optionNames.join(", ") + ') wirklich gelöscht werden?'
    }

    this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        type: "warning",
        title: "Löschen bestätigen",
        message: message
      }
    }).afterClosed().subscribe(result => {
      if (result === undefined) return;
      if (!result) return;
      let category = this.categories.find(cat => cat.name === this.selectedCat);
      if (elementToRemove.kind == "option") {
        let group: Group = category.selectables.find(sel => sel.name == elementToRemove.groupID) as Group
        // remove entire group
        let index = category.selectables.findIndex(sel => sel.name === group.name);
        category.selectables.splice(index, 1)

      }
      if (elementToRemove.kind == "box") {
        let index = category.selectables.findIndex(sel => sel.name === elementToRemove.name);
        category.selectables.splice(index, 1)
      }
      this.optionsComponent.initRows(this.categories)
      this.updateUndoStack()
    });
  }

  addCheckBox() {
    this.dialog.open(DialogAddBoxComponent, {
      width: '630px',
    }).afterClosed().subscribe(result => {
      if (result === undefined) return;
      let box: CheckBox = result as CheckBox
      this.categories.find(cat => cat.name === this.selectedCat).selectables.push(box);
      this.optionsComponent.initRows(this.categories)
      this.updateUndoStack()
    });
  }

  editCheckBox(boxToEdit: CheckBox) {
    let dialogData = {
      boxToEdit: JSON.parse(JSON.stringify(boxToEdit))
    };
    this.dialog.open(DialogAddBoxComponent, {
      width: '630px',
      data: dialogData
    }).afterClosed().subscribe(result => {
      if (result === undefined) return;
      let category = this.categories.find(cat => cat.name === this.selectedCat);
      let index = category.selectables.findIndex(box => box.name === boxToEdit.name);
      category.selectables[index] = result;
      this.optionsComponent.initRows(this.categories)
      this.updateUndoStack()
    });
  }

}

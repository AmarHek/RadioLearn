/* eslint-disable @typescript-eslint/member-ordering */
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Renderer2, Input, OnChanges, SimpleChanges
} from "@angular/core";
import {fromEvent} from "rxjs";
import {switchMap, takeUntil} from "rxjs/operators";
import {MatDialog} from "@angular/material/dialog";

import {environment} from "@env/environment";
import {Annotation, BoundingBox, BoxLabel, Image} from "@app/core/models";
import {BackendService, ImageDisplayService, MatDialogService} from "@app/core";
import {InputDialogComponent} from "@app/shared/input-dialog/input-dialog.component";
import {ConfirmDialogComponent, ConfirmDialogModel} from "@app/shared";

@Component({
  selector: "app-image-annotator",
  templateUrl: "./image-annotator.component.html",
  styleUrls: ["./image-annotator.component.scss"]
})
export class ImageAnnotatorComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() scans: {
    id: string;
    mainScan: Image;
    lateralScan?: Image;
    preScan?: Image;
  };
  @Input() annotations: {
    main:     Annotation[];
    lateral:  Annotation[];
    pre:      Annotation[];
  };
  @Input() boxLabels: BoxLabel[];

  imageUrl = environment.images;

  // state variables for current display
  currentMode: string;
  currentScanUrl: string;
  currentScaleFactor = 1.0;
  currentWidth: number;
  currentHeight: number;
  currentTooltip = "";

  // state variables for canvas layers
  displayBoxes: boolean;
  enableEdit: boolean;
  enableDelete: boolean;
  enableZoom: boolean;

  // state variable to show warning that no pathology is selected
  warnLabel = false;

  // coordinates of the currently drawn box
  startX = 0;
  startY = 0;
  width = 0;
  height = 0;

  // currently drawn boxes
  tempBoxes: {
    main: BoundingBox[];
    lateral: BoundingBox[];
    pre: BoundingBox[];
  };

  // current chosen Pathology for label
  currentLabel: string;
  currentComment: string;

  // Zoom lens
  lensSize = 140;
  maxLensSize = 250;

  @ViewChild("boxLayer", {static: false }) drawLayer: ElementRef;
  private drawLayerElement;
  private drawContext: CanvasRenderingContext2D;

  @ViewChild("labelLayer", {static: false }) labelLayer: ElementRef;
  private labelLayerElement;
  private labelContext: CanvasRenderingContext2D;

  @ViewChild("tempLayer", {static: false }) tempLayer: ElementRef;
  private tempLayerElement;
  private tempContext: CanvasRenderingContext2D;

  private hoverLayerElement;
  private hoverContext: CanvasRenderingContext2D;
  @ViewChild("hoverLayer", {static: false }) set hoverLayer(layer: ElementRef) {
    if (this.displayBoxes) {
      this.hoverLayerElement = layer.nativeElement;
      this.hoverContext = this.hoverLayerElement.getContext("2d");
      this.setHoverListeners();
    }
  };

  @ViewChild("tipDiv", {static: false}) tipDiv: ElementRef;
  private tipDivElement;

  private deleteLayerElement;
  private deleteContext: CanvasRenderingContext2D;
  @ViewChild("deleteLayer", {static: false }) set deleteLayer(layer: ElementRef) {
    if (this.enableDelete) {
      this.deleteLayerElement = layer.nativeElement;
      this.deleteContext = this.deleteLayerElement.getContext("2d");
      this.addDeleteListeners();
    }
  };

  private editLayerElement;
  private editContext: CanvasRenderingContext2D;
  @ViewChild("editLayer", {static: false }) set editLayer(layer: ElementRef) {
    if (this.enableEdit) {
      this.editLayerElement = layer.nativeElement;
      this.editContext = this.editLayerElement.getContext("2d");
      this.rectangleDrawing();
    }
  };

  @ViewChild("sourceImage") sourceImage: ElementRef;
  private zoomDivElement;
  private zoomLayerElement;
  private lensElement;
  @ViewChild("lensContainer") set zoom(container: ElementRef) {
    if (this.enableZoom) {
      const containerElement = container.nativeElement;
      this.zoomDivElement = containerElement.children[0];
      this.zoomLayerElement = containerElement.children[2];
      this.lensElement = containerElement.children[1];
      this.imageZoom();
    }
  }

  constructor(private backendCaller: BackendService,
              private renderer: Renderer2,
              private dialogService: MatDialogService,
              private dialog: MatDialog,
              private imageDisplayService: ImageDisplayService) { }

  ngOnInit(): void {
    this.tempBoxes = {
      main: [],
      lateral: [],
      pre: []
    };

    this.displayBoxes = false;
    this.enableDelete = false;
    this.enableEdit = false;
    this.initMain();
  }

  ngAfterViewInit(): void {
    this.drawLayerElement = this.drawLayer.nativeElement;
    this.drawContext = this.drawLayerElement.getContext("2d");
    this.labelLayerElement = this.labelLayer.nativeElement;
    this.labelContext = this.labelLayerElement.getContext("2d");
    this.tempLayerElement = this.tempLayer.nativeElement;
    this.tempContext = this.tempLayerElement.getContext("2d");
    this.tipDivElement = this.tipDiv.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.scans !== undefined) {
      this.changeMode("main");
    }
  }

  initMain() {
    this.currentMode = "main";
    this.setCurrentImage();
    this.setCurrentDimensions();
  }

  clearCanvas() {
    this.drawContext.clearRect(0, 0, this.drawLayerElement.width, this.drawLayerElement.height);
    this.labelContext.clearRect(0, 0, this.labelLayerElement.width, this.labelLayerElement.height);
  }

  setCurrentImage() {
    const filename = this.scans[this.currentMode + "Scan"].filename;
    this.currentScanUrl = this.imageUrl + this.scans.id + "/" + filename;
  }

  setCurrentDimensions() {
    this.imageDisplayService.computeCanvasDimensions(this.currentScanUrl, (h, w, s) => {
      this.currentHeight = h;
      this.currentWidth = w;
      this.currentScaleFactor = s;
    });
  }

  changeMode(mode: string) {
    this.currentMode = mode;
    this.enableDelete = false;
    this.enableZoom = false;
    this.setCurrentImage();
    this.setCurrentDimensions();
    if (this.displayBoxes) {
      this.drawBoxes();
    }
    if (this.enableEdit) {
      this.enableEdit = false;
    }
  }

  toggleBoxes() {
    this.displayBoxes = !this.displayBoxes;
    this.clearCanvas();
    if (this.displayBoxes) {
      this.drawBoxes();
    }
  }

  toggleDelete() {
    if (this.enableEdit) {
      this.enableEdit = false;
    }
    if (this.enableZoom) {
      this.enableZoom = false;
    }

    if (!this.displayBoxes) {
      this.toggleBoxes();
    }
    this.enableDelete = !this.enableDelete;
  }

  toggleEditor() {
    if (this.enableZoom) {
      this.enableZoom = false;
    }
    if (this.enableDelete) {
      this.enableDelete = false;
    }
    if (!this.displayBoxes) {
      this.toggleBoxes();
    }

    this.enableEdit = !this.enableEdit;
    this.tempContext.clearRect(0, 0, this.tempLayerElement.width, this.tempLayerElement.height);
    if (this.enableEdit) {
      this.drawTempBoxes();
    }
  }

  toggleZoom() {
    if (this.enableEdit) {
      this.enableEdit = false;
    }
    if (this.enableDelete) {
      this.enableDelete = false;
    }

    this.enableZoom = !this.enableZoom;
  }

  zoomIn(increment: number) {
    this.lensSize += increment;
    this.lensSize = Math.min(this.lensSize, this.maxLensSize);
    this.imageZoom();
  }

  drawBoxes() {
    this.clearCanvas();
    const annotations = this.annotations[this.currentMode];
    for (const annotation of annotations) {
      for (const bbox of annotation.boxes) {
        this.imageDisplayService.drawRect(this.drawContext, bbox,
          this.currentScaleFactor, this.imageDisplayService.displayBoxColor[annotations.indexOf(annotation)]);
      }
      this.imageDisplayService.addLabelToContext(this.labelContext, annotation, this.currentScaleFactor,
        this.imageDisplayService.displayBoxColor[annotations.indexOf(annotation)], annotation.boxes[0], annotations);
    }
  }

  drawTempBoxes() {
    this.tempContext.clearRect(0, 0, this.tempLayerElement.width, this.tempLayerElement.height);
    const boxes = this.tempBoxes[this.currentMode];
    for (const box of boxes) {
      this.imageDisplayService.drawRect(this.tempContext, box, this.currentScaleFactor, "blue");
    }
  }

  setHoverListeners() {
    const annotations = this.annotations[this.currentMode];
    const rect = this.hoverLayerElement.getBoundingClientRect();

    const parent = this;
    this.hoverLayerElement.removeEventListener("mousemove", toolTip);
    this.hoverLayerElement.addEventListener("mousemove", toolTip);
    function toolTip(e) {
      let hit = false;
      for (const annotation of annotations) {
        if (annotation.comment !== undefined) {
          if (annotation.comment.length > 0) {
            const x = parent.currentScaleFactor * annotation.labelLeft;
            const y = parent.currentScaleFactor * annotation.labelTop + 5 + 20;
            const h = 30; // approx. height of 18pt font size
            const w = parent.labelContext.measureText(annotation.label).width;
            if (
              x <= e.clientX - rect.left &&
              e.clientX - rect.left <= x + w &&
              y - h <= e.clientY - rect.top &&
              e.clientY - rect.top <= y
            ) {
              // TODO Compute corner coordinates of tooltip based on position in image
              parent.showToolTip(e.clientX - rect.left, e.clientY - rect.top + 20, annotation.comment);
              hit = true;
            }
          }
        }
      }
      if (!hit) {
        parent.hideToolTip();
      }
    }
  }

  showToolTip(x, y, text) {
    this.currentTooltip = text;
    this.renderer.setStyle(this.tipDivElement, "top", y + "px");
    this.renderer.setStyle(this.tipDivElement, "left", x + "px");
  }

  hideToolTip() {
    this.renderer.setStyle(this.tipDivElement, "left", "-800px");
  }

  addDeleteListeners() {
    const annotations = this.annotations[this.currentMode];
    const rect = this.drawLayerElement.getBoundingClientRect();
    const parent = this;
    for (const annotation of annotations) {
      const color = this.imageDisplayService.displayBoxColor[annotations.indexOf(annotation)];
      for (const bbox of annotation.boxes) {
        this.deleteLayerElement.addEventListener("mousemove", (e) => {
          const x = bbox.left * parent.currentScaleFactor;
          const y = bbox.top * parent.currentScaleFactor;
          const w = bbox.width * parent.currentScaleFactor;
          const h = bbox.height * parent.currentScaleFactor;
          if (
            x <= e.clientX - rect.left &&
            e.clientX - rect.left <= x + w &&
            y <= e.clientY - rect.top &&
            e.clientY - rect.top <= y + h
          ) {
            parent.imageDisplayService.drawRect(this.deleteContext, bbox, this.currentScaleFactor, "red");
          } else {
            parent.imageDisplayService.drawRect(this.deleteContext, bbox, this.currentScaleFactor, color);
          }
        });
        this.deleteLayerElement.addEventListener("click", (e) => {
          const x = bbox.left * parent.currentScaleFactor;
          const y = bbox.top * parent.currentScaleFactor;
          const w = bbox.width * parent.currentScaleFactor;
          const h = bbox.height * parent.currentScaleFactor;
          if (
            x <= e.clientX - rect.left &&
            e.clientX - rect.left <= x + w &&
            y <= e.clientY - rect.top &&
            e.clientY - rect.top <= y + h
          ) {
            parent.removeBoxAlert(annotation, bbox);
          }
        });
      }
    }
  }

  removeBoxAlert(annotation, bbox) {
    const data = new ConfirmDialogModel("warning", "Box löschen?",
      "Soll diese Box wirklich gelöscht werden?");
    const dialogConfig = this.dialogService.defaultConfig("400px", data);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.removeBox(annotation, bbox);
      }
    });
  }

  removeBox(annotation: Annotation, bbox: BoundingBox) {
    const annotIdx = this.annotations[this.currentMode].indexOf(annotation);
    const boxIdx = this.annotations[this.currentMode][annotIdx].boxes.indexOf(bbox);
    this.annotations[this.currentMode][annotIdx].boxes.splice(boxIdx, 1);

    // check if annotation has no boxes left and remove if there are none
    if (this.annotations[this.currentMode][annotIdx].boxes.length === 0) {
      this.annotations[this.currentMode].splice(annotIdx, 1);
    } else {
      // otherwise, compute new label coordinates
      console.log(this.annotations[this.currentMode][annotIdx].boxes);
      const newLabelCoordinates = this.getLabelCoordinates(this.annotations[this.currentMode][annotIdx].boxes);
      this.annotations[this.currentMode][annotIdx].labelLeft = newLabelCoordinates[0];
      this.annotations[this.currentMode][annotIdx].labelTop = newLabelCoordinates[1];
    }

    // disable delete layer and redraw in the end
    this.enableDelete = false;
    this.drawBoxes();
  }

  rectangleDrawing() {
    let rect = this.editLayerElement.getBoundingClientRect();
    fromEvent(this.editLayerElement, "mousedown")
      .pipe(
        switchMap((e: MouseEvent) => {
          rect = this.editLayerElement.getBoundingClientRect();
          this.startX = e.clientX - rect.left;
          this.startY = e.clientY - rect.top;
          return fromEvent(this.editLayerElement, "mousemove").pipe(
            takeUntil(fromEvent(this.editLayerElement, "mouseup")),
            takeUntil(fromEvent(this.editLayerElement, "mouseleave"))
          );
        })
      ).subscribe((event: MouseEvent) => {
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      this.width = x - this.startX;
      this.height = y - this.startY;

      this.imageDisplayService.setCanvasProperties(this.editContext, 5, "square", "green");
      this.editContext.beginPath();
      this.editContext.clearRect(0, 0, this.editLayerElement.width, this.editLayerElement.height);
      this.editContext.rect(this.startX, this.startY, this.width, this.height);
      this.editContext.stroke();
    });
  }

  saveTempBox() {
    if (!(this.width === 0 && this.height === 0)) {
      this.fixNegativeCoordinates();
      this.tempBoxes[this.currentMode].push({
        left: this.startX / this.currentScaleFactor,
        top: this.startY / this.currentScaleFactor,
        height: this.height / this.currentScaleFactor,
        width: this.width / this.currentScaleFactor
      });
      this.editContext.clearRect(0, 0, this.editLayerElement.width, this.editLayerElement.height);
      this.width = 0;
      this.height = 0;
      this.drawTempBoxes();
    }
  }

  deleteLastTempBox() {
    this.tempBoxes[this.currentMode].pop();
    this.drawTempBoxes();
  }

  saveNewAnnotation() {
    if (this.currentLabel === undefined) {
      this.warnLabel = true;
    } else {
      // gather all necessary data
      const boxes = this.tempBoxes[this.currentMode];
      if (boxes.length > 0) {
        const labelCoordinates = this.getLabelCoordinates(boxes);

        // push new annotation to array of proper mode
        this.annotations[this.currentMode].push({
          boxes,
          label: this.currentLabel,
          comment: this.currentComment,
          labelLeft: labelCoordinates[0],
          labelTop: labelCoordinates[1]
        });

        // update state and empty buffer variables
        this.warnLabel = false;
        this.currentLabel = undefined;
        this.currentComment = undefined;
        this.tempBoxes[this.currentMode] = [];
        this.tempContext.clearRect(0, 0, this.tempLayerElement.width, this.tempLayerElement.height);
        if (this.displayBoxes) {
          this.drawBoxes();
        }
      }
    }
  }

  getLabelCoordinates(boxes: BoundingBox[]): [number, number] {
    // Idea: Identify most left and bottom coordinate from all boxes and hope it won't look weird
    let labelX = 5000; // start very far right
    let labelY = 0; // start at the top
    for (const box of boxes) {
      if (labelY < (box.top + box.height)) {
        labelY = box.top + box.height;
      }
      if (labelX > (box.left)) {
        labelX = box.left;
      }
    }
    return [labelX, labelY];
  }

  openCommentDialog() {
    const data = {
      title: "Annotationen: Kommentar",
      message: "Kommentar eingeben",
      input: this.currentComment
    };
    const dialogConfig = this.dialogService.defaultConfig("400px", data);
    const dialogRef = this.dialog.open(InputDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult !== false) {
        this.currentComment = dialogResult;
      }
    });
  }

  imageZoom() {
    this.imageDisplayService.setImageZoomEventListeners(this.sourceImage.nativeElement,
      this.lensElement, this.lensSize, this.zoomLayerElement, this.zoomDivElement);
  }

  private fixNegativeCoordinates() {
    // in case the box is drawn from bottom right to top left: adjust negative width and height
    if (this.width < 0) {
      this.width = - this.width;
      this.startX = this.startX - this.width;
    }
    if (this.height < 0) {
      this.height = - this.height;
      this.startY = this.startY - this.height;
    }
  }

}

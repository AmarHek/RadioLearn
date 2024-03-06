/* eslint-disable @typescript-eslint/member-ordering */
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Renderer2, Input, OnChanges, SimpleChanges
} from "@angular/core";

import {environment} from "@env/environment";
import {Annotation, BoundingBox, Category, Image} from "@app/models";
import {BackendCallerService, ImageDisplayService, MatDialogService} from "@app/core";
import {fromEvent} from "rxjs";
import {switchMap, takeUntil} from "rxjs/operators";
import {MatLegacyDialog as MatDialog} from "@angular/material/legacy-dialog";
import {AnnotationPopupComponent} from "@app/shared/annotation-popup/annotation-popup.component";
import {SettingsService} from "@app/core/services/settings.service";

const BOX_LINE_WIDTH = 5;

@Component({
  selector: "app-image-display-student",
  templateUrl: "./image-display-student.component.html",
  styleUrls: ["./image-display-student.component.scss"]
})
export class ImageDisplayStudentComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() scans: {
    id: string;
    mainScan: Image;
    lateralScan?: Image;
    preScan?: Image;
  };
  @Input() annotations: {
    main: Annotation[];
    lateral: Annotation[];
    pre: Annotation[];
  };

  annotationsStudent: {
    main: Annotation[];
    lateral: Annotation[];
    pre: Annotation[];
  };

  @Input() showCommentButton: boolean;

  @Input() isMobile: boolean;
  @Input() drawMode: boolean;
  @Input() categories: Category[];

  imageUrl = environment.images;

  // state variables for current display
  currentImageType: string; // either "main", "lateral" or "pre"
  currentScanUrl: string;
  currentScaleFactor = 1.0;
  currentWidth: number;
  currentHeight: number;
  currentTooltip = "";

  // state variables for canvas layers
  displayBoxesSolution: boolean = false;
  enableZoom: boolean;

  startX = 0;
  startY = 0;
  width = 0;
  height = 0;

  tempBoxes: {
    main: BoundingBox[];
    lateral: BoundingBox[];
    pre: BoundingBox[];
  };

  // Zoom lens
  lensSize = 140;
  maxLensSize = 240;

  @ViewChild("boxLayer", {static: false}) drawLayer: ElementRef;
  private drawLayerElement;
  private drawContext: CanvasRenderingContext2D;

  @ViewChild("labelLayer", {static: false}) labelLayer: ElementRef;
  private labelLayerElement;
  private labelContext: CanvasRenderingContext2D;

  @ViewChild("tempLayer", {static: false}) tempLayer: ElementRef;
  private tempLayerElement;
  private tempContext: CanvasRenderingContext2D;

  private hoverLayerElement;
  private hoverContext: CanvasRenderingContext2D;

  private editLayerElement;
  private editContext: CanvasRenderingContext2D;

  private enableEdit: boolean = true;

  @ViewChild("editLayer", {static: false}) set editLayer(layer: ElementRef) {
    if (this.enableEdit) {
      this.editLayerElement = layer.nativeElement;
      this.editContext = this.editLayerElement.getContext("2d")
      this.rectangleDrawing()
    }
  }

  @ViewChild("hoverLayer", {static: false}) set hoverLayer(layer: ElementRef) {
    if (this.displayBoxesSolution) {
      this.hoverLayerElement = layer.nativeElement;
      this.hoverContext = this.hoverLayerElement.getContext("2d");
      this.setHoverListeners();
    }
  };

  @ViewChild("tipDiv", {static: false}) tipDiv: ElementRef;
  private tipDivElement;

  @ViewChild("sourceImage") sourceImage: ElementRef;
  private zoomDivElement;
  private zoomLayerElement;
  private lensElement;

  @ViewChild("lensContainer") set zoom(container: ElementRef) {
    if (this.enableZoom) {
      const containerElement = container.nativeElement;
      this.zoomDivElement = containerElement.children[0];
      this.lensElement = containerElement.children[1];
      this.zoomLayerElement = containerElement.children[2];
      this.imageZoom();
    }
  }

  constructor(private backendCaller: BackendCallerService,
              private renderer: Renderer2,
              private dialog: MatDialog,
              private dialogService: MatDialogService,
              private imageDisplayService: ImageDisplayService,
              private settingsService: SettingsService) {

    this.settingsService.getSettingObservable().subscribe((setting) => {
      if (setting.setting_id == settingsService.Settings.ColorTheme.ID) {
        this.drawBoxesStudent()
      }
    })
  }

  ngOnInit(): void {
    this.tempBoxes = {
      main: [],
      lateral: [],
      pre: []
    };
    this.annotationsStudent = {
      main: [],
      lateral: [],
      pre: []
    };
    this.displayBoxesSolution = false;
    this.enableEdit = this.drawMode;

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
    if (this.drawContext === undefined) return
    if (changes.scans !== undefined) {
      this.changeToImageType("main");
    }
    this.hideToolTip()
  }

  initMain() {
    this.currentImageType = "main";
    this.setCurrentImage();
    this.setCurrentDimensions();
  }

  clearCanvas() {
    this.drawContext.clearRect(0, 0, this.drawLayerElement.width, this.drawLayerElement.height);
    this.labelContext.clearRect(0, 0, this.labelLayerElement.width, this.labelLayerElement.height);
  }

  clearData() {
    this.annotationsStudent = {
      main: [],
      lateral: [],
      pre: []
    };
  }

  /**
   * Enables click and drag to draw rectangles on the edit layer.
   */
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

  setCurrentImage() {
    const filename = this.scans[this.currentImageType + "Scan"].filename;
    this.currentScanUrl = this.imageUrl + this.scans.id + "/" + filename;
  }

  deleteLastTempBox() {
    this.tempBoxes[this.currentImageType].pop()
    this.drawTempBoxes()
  }

  setCurrentDimensions() {
    this.imageDisplayService.computeCanvasDimensions(this.currentScanUrl, (h, w, s) => {
      this.currentHeight = h;
      this.currentWidth = w;
      this.currentScaleFactor = s;
    });
  }

  // Change between "main", "pre", "lateral" etc.
  changeToImageType(newImageType: string) {
    this.clearCanvas()
    this.currentImageType = newImageType;
    this.enableZoom = false;
    this.setCurrentImage();
    this.setCurrentDimensions();
    if (this.displayBoxesSolution) {
      setTimeout(() => this.drawBoxesSolution(), 5);
      this.setHoverListeners();
    }
    setTimeout(() => this.drawBoxesStudent(this.displayBoxesSolution), 5)
  }


  toggleBoxes() {
    this.displayBoxesSolution = !this.displayBoxesSolution;
    this.clearCanvas();
    if (this.displayBoxesSolution) {
      this.drawBoxesSolution();
    }
  }

  toggleZoom() {
    this.enableZoom = !this.enableZoom;
  }

  zoomIn(increment: number) {
    this.lensSize += increment;
    this.lensSize = Math.min(this.lensSize, this.maxLensSize);
    this.imageZoom();
  }

  getStudentBoxes() {
    return this.annotationsStudent;
  }

  checkBoxes() {
    this.toggleBoxes()
    this.drawBoxesStudent(true)
  }

  /**
   * Draws the solution bounding boxes on the image. In non-draw mode, they are colored in different colors that allow
   * distinguishing between different annotations. In draw-mode the boxes are colored according to their correctness
   * with respect to the student boxes (red / yellow / green).
   */
  drawBoxesSolution() {
    if (this.drawMode && !this.anyAnnotation()) {
      //nothing to draw => display "Unauffälliger Röntgenthorax"
      let color = "green"
      let textAppendix = "✅"
      if (this.anyStudentAnnotation()) {
        // student mistakenly annotated something
        color = "red"
        textAppendix = "❌"
      }
      this.imageDisplayService.topCenterText(this.drawContext, this.currentScaleFactor, "Unauffälliger Röntgenthorax " + textAppendix, color);
      return
    }

    const annotations = this.annotations[this.currentImageType];
    for (const annotation of annotations) {
      let color = this.imageDisplayService.displayBoxColor[annotations.indexOf(annotation)]
      for (const bbox of annotation.boxes) {
        if (this.drawMode) {
          // overwrite annotation color with feedback color (red / yellow / green) when in draw mode
          color = this.feedbackColorForSolutionBox(annotation, bbox)
        }
        this.imageDisplayService.drawRect(this.drawContext, bbox, this.currentScaleFactor, color, this.drawMode, color);
      }
      this.imageDisplayService.addLabelToContext(this.labelContext, annotation, this.currentScaleFactor, color,
        annotation.boxes[0], annotations, this.drawMode);
    }
  }

  anyAnnotation(): boolean {
    if (this.annotations["main"].length > 0) {
      return true
    }
    if (this.annotations["lateral"].length > 0) {
      return true
    }
    return this.annotations["pre"].length > 0;
  }

  anyStudentAnnotation(): boolean {
    if (this.annotationsStudent["main"].length > 0) {
      return true
    }
    if (this.annotationsStudent["lateral"].length > 0) {
      return true
    }
    return this.annotationsStudent["pre"].length > 0;
  }

  /**
   * Draws the student's annotation boxes on the image.
   * @param feedbackColor If set to false, the boxes will be displayed in different colors, to distinguish
   * between annotations (before checkErrors is called). If set to true, the boxes are colored according to their
   * correctness with respect to the solution boxes (red / yellow / green).
   */
  drawBoxesStudent(feedbackColor = false) {
    const annotations = this.annotationsStudent[this.currentImageType];
    for (const annotation of annotations) {
      let color = this.imageDisplayService.displayBoxColor[annotations.indexOf(annotation)]
      for (const bbox of annotation.boxes) {
        if (feedbackColor) {
          color = this.feedbackColorForStudentBox(annotation, bbox)
        }
        this.imageDisplayService.drawRect(this.drawContext, bbox, this.currentScaleFactor, color);
      }
      this.imageDisplayService.addLabelToContext(this.labelContext, annotation, this.currentScaleFactor,
        color, annotation.boxes[0], annotations);
    }
  }

  /**
   * Determines the feedback color for a solution box based on its IoU (Intersection over Union) with the student's annotations.
   * @param {Annotation} solutionAnnotation - The annotation of the solution box.
   * @param {BoundingBox} solutionBox - The coordinates of the solution box.
   * @returns {string} - The feedback color in the format "rgba(r, g, b, a)".
   */
  feedbackColorForSolutionBox(solutionAnnotation, solutionBox) {
    let feedbackColors = ["rgba(255,0,0, 0.3)", "rgba(255,196,0,0.3)", "rgb(0,189,0, 0.3)"]
    let maxIoU = 0
    this.annotationsStudent[this.currentImageType].forEach(studentAnnotation => {
      if (!studentAnnotation.label.includes(solutionAnnotation.label)) {
        return
      }
      studentAnnotation.boxes.forEach(studentBox => {
        let r1: Rectangle = {
          x1: studentBox.left,
          y1: studentBox.top,
          x2: studentBox.left + studentBox.width,
          y2: studentBox.top + studentBox.height
        }
        let r2: Rectangle = {
          x1: solutionBox.left,
          y1: solutionBox.top,
          x2: solutionBox.left + solutionBox.width,
          y2: solutionBox.top + solutionBox.height
        }
        let iou = this.calculateIoU(r1, r2)
        maxIoU = Math.max(iou, maxIoU)
      })
    })

    if (maxIoU > 0.5) {
      return feedbackColors[2]
    }

    if (maxIoU > 0.2) {
      return feedbackColors[1]
    }

    return feedbackColors[0]
  }

  /**
   * Determines the feedback color for a student box based on its IoU (Intersection over Union) with the correct annotations.
   * @param {Annotation} drawnAnnotation - The annotation of the student's drawn box.
   * @param {BoundingBox} drawnBox - The coordinates of the student's drawn box.
   * @returns {string} - The feedback color in the format "rgba(r, g, b, a)".
   */
  feedbackColorForStudentBox(drawnAnnotation, drawnBox) {
    let feedbackColors = ["rgba(255,0,0,1)", "rgba(255,196,0,1)", "rgb(0,189,13)"]
    let maxIoU = 0
    this.annotations[this.currentImageType].forEach(correctAnnotation => {
      if (!correctAnnotation.label.includes(drawnAnnotation.label)) {
        return
      }
      correctAnnotation.boxes.forEach(solutionBox => {
        let r1: Rectangle = {
          x1: solutionBox.left,
          y1: solutionBox.top,
          x2: solutionBox.left + solutionBox.width,
          y2: solutionBox.top + solutionBox.height
        }
        let r2: Rectangle = {
          x1: drawnBox.left,
          y1: drawnBox.top,
          x2: drawnBox.left + drawnBox.width,
          y2: drawnBox.top + drawnBox.height
        }
        let iou = this.calculateIoU(r1, r2)
        maxIoU = Math.max(iou, maxIoU)
      })
    })

    if (maxIoU > 0.5) {
      return feedbackColors[2]
    }

    if (maxIoU > 0.2) {
      return feedbackColors[1]
    }

    return feedbackColors[0]
  }

  /**
   * Sets up hover listeners for the annotation tool. Not applicable in mobile mode.
   * When the mouse is moved over the hover layer, it checks if the mouse is within the bounds
   * of any annotated labels and displays a tooltip with the corresponding comment if available.
   */
  setHoverListeners() {
    if (this.isMobile) return
    const annotations = this.annotations[this.currentImageType];
    const rect = this.hoverLayerElement.getBoundingClientRect();

    const parent = this;
    this.hoverLayerElement.removeEventListener("mousemove", toolTip);
    this.hoverLayerElement.addEventListener("mousemove", toolTip);

    function toolTip(e) {
      let hit = false;
      let mouseX = e.clientX - rect.left
      let mouseY = e.clientY - rect.top
      for (const annotation of annotations) {
        if (annotation.comment?.length > 0) {
          const x = parent.currentScaleFactor * annotation.labelLeft;
          const y = parent.currentScaleFactor * annotation.labelTop + BOX_LINE_WIDTH + 20;
          const h = 30; // approx. height of 18pt font size
          const w = parent.labelContext.measureText(annotation.label).width;

          const isWithinWidth = mouseX >= x && mouseX <= x + w;
          const isWithinHeight = mouseY >= y - h && mouseY <= y;
          if (isWithinWidth && isWithinHeight) {
            // TODO Compute corner coordinates of tooltip based on position in image
            parent.showToolTip(mouseX, mouseY + 20, annotation.comment);
            hit = true;
          }
        }
      }
      if (!hit) {
        parent.hideToolTip();
      }
    }
  }

  showAllComments() {
    for (const annotation of this.annotations[this.currentImageType]) {
      if (annotation.comment?.length > 0) {
        this.showToolTip(annotation.labelLeft * this.currentScaleFactor, annotation.labelTop * this.currentScaleFactor + 30, annotation.comment)
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

  imageZoom() {
    this.imageDisplayService.setImageZoomEventListeners(this.sourceImage.nativeElement,
      this.lensElement, this.lensSize, this.zoomLayerElement, this.zoomDivElement);
  }

  saveTempBox() {
    if (this.width === 0 && this.height === 0) return
    this.fixNegativeCoordinates();
    this.tempBoxes[this.currentImageType].push({
      left: this.startX / this.currentScaleFactor,
      top: this.startY / this.currentScaleFactor,
      height: this.height / this.currentScaleFactor,
      width: this.width / this.currentScaleFactor
    });
    this.editContext.clearRect(0, 0, this.editLayerElement.width, this.editLayerElement.height);
    this.width = 0;
    this.height = 0;
    this.drawTempBoxes();
    this.annotationDialog()
  }

  annotationDialog() {
    const categories = this.categories
    const dialogConfig = this.dialogService.defaultConfig("300px", {categories});
    const dialogRef = this.dialog.open(AnnotationPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.saveNewAnnotation(dialogResult)
      } else {
        //dialog has been cancelled
        this.deleteLastTempBox()
      }
    });
  }

  saveNewAnnotation(label) {
    // gather all necessary data
    const boxes = this.tempBoxes[this.currentImageType];
    if (boxes.length == 0) return;
    const labelCoordinates = this.getLabelCoordinates(boxes);

    // push new annotation to array of proper mode
    this.annotationsStudent[this.currentImageType].push({
      boxes,
      label: label,
      comment: "",
      labelLeft: labelCoordinates[0],
      labelTop: labelCoordinates[1]
    });

    // update state and empty buffer variables
    this.tempBoxes[this.currentImageType] = [];
    this.tempContext.clearRect(0, 0, this.tempLayerElement.width, this.tempLayerElement.height);
    this.drawBoxesStudent()
  }

  drawTempBoxes() {
    this.tempContext.clearRect(0, 0, this.tempLayerElement.width, this.tempLayerElement.height);
    const boxes = this.tempBoxes[this.currentImageType];
    for (const box of boxes) {
      this.imageDisplayService.drawRect(this.tempContext, box, this.currentScaleFactor, "blue");
    }
  }

  private fixNegativeCoordinates() {
    // in case the box is drawn from bottom right to top left: adjust negative width and height
    if (this.width < 0) {
      this.width = -this.width;
      this.startX = this.startX - this.width;
    }
    if (this.height < 0) {
      this.height = -this.height;
      this.startY = this.startY - this.height;
    }
  }

  getLabelCoordinates(boxes: BoundingBox[]): [number, number] {
    // Idea: Identify most left and bottom coordinate from all boxes and hope it won't look weird
    let labelX = 5000; // start very far right
    let labelY = 0; // start at the top
    for (const box of boxes) {
      let boxBottomY = box.top + box.height
      if (labelY < boxBottomY) {
        labelY = boxBottomY;
      }
      if (labelX > box.left) {
        labelX = box.left;
      }
    }
    return [labelX, labelY];
  }


  calculateIntersection(rect1: Rectangle, rect2: Rectangle): number {
    const xOverlap = Math.max(0, Math.min(rect1.x2, rect2.x2) - Math.max(rect1.x1, rect2.x1));
    const yOverlap = Math.max(0, Math.min(rect1.y2, rect2.y2) - Math.max(rect1.y1, rect2.y1));
    return xOverlap * yOverlap;
  }

  calculateUnion(rect1: Rectangle, rect2: Rectangle): number {
    const rect1Area = (rect1.x2 - rect1.x1) * (rect1.y2 - rect1.y1);
    const rect2Area = (rect2.x2 - rect2.x1) * (rect2.y2 - rect2.y1);
    return rect1Area + rect2Area - this.calculateIntersection(rect1, rect2);
  }

  calculateIoU(rect1: Rectangle, rect2: Rectangle): number {
    const intersection = this.calculateIntersection(rect1, rect2);
    const union = this.calculateUnion(rect1, rect2);
    return intersection / union;
  }

}

interface Rectangle {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

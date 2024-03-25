import {Injectable} from "@angular/core";
import {Annotation, BoundingBox} from "app/core/models";
import {DisplayService} from "@app/core";
import {SettingsService} from "@app/core/services/settings.service";

@Injectable({
  providedIn: "root"
})
export class ImageDisplayService {

  maxImageHeight = 750;
  maxImageWidth = 890;

  boxLineWidth = 5
  displayBoxColor_regular =
    ["rgb(51, 51, 255)", "rgb(223,103,3)", "rgb(255, 51, 51)", "rgb(33,186,33)", "rgb(255, 51, 255)",
      "rgb(21,155,155)", "rgb(204,2,2)", "rgb(56,172,0)",
      "rgb(102, 51, 255)", "rgb(255, 51, 102)", "rgb(51, 102, 255)", "rgb(4,130,0)",
      "rgb(255, 102, 76)", "rgb(0,181,99)", "rgb(148,76,255)", "rgb(255, 51, 76)",
      "rgb(76, 51, 255)", "rgb(223,171,0)", "rgb(255, 76, 51)", "rgb(51, 76, 255)"]

  displayBoxColor_colorblind = ["rgba(170,110,40,1)", "rgba(128,128,0,1)", "rgba(0,128, 128,1)",
    "rgba(230,25,75,1)", "rgba(245,130,48,1)", "rgba(255,255,25,1)", "rgba(210,245,60,1)", "rgba(60,180,75,1)",
    "rgba(70,240,240,1)", "rgba(0,130,200,1)", "rgba(145,30,180,1)", "rgba(240,50,230,1)", "rgba(128,128,128,1)",
    "rgba(250,190,212,1)", "rgba(255,215,180,1)", "rgba(255,250,200,1)", "rgba(170,255,195,1)", "rgba(128,0,0,1)",
    "rgba(220,190,255,1)", "rgba(0,0,0,1)"];

  displayBoxColor = this.displayBoxColor_regular

  constructor(private displayService: DisplayService, private settingsService: SettingsService) {
    this.displayService.isMobile.subscribe((isMobile) => {
      if (isMobile) {
        this.maxImageWidth = window.innerWidth - 2;
      }
    });

    this.settingsService.getSettingObservable().subscribe((setting) => {
      if (setting.setting_id == settingsService.Settings.ColorTheme.ID) {
        if (setting.new_value == settingsService.Settings.ColorTheme.valid_values.colorblind) {
          this.displayBoxColor = this.displayBoxColor_colorblind
        } else {
          this.displayBoxColor = this.displayBoxColor_regular
        }
      }
    })
  }

  computeCanvasDimensions(imgUrl: string, callback) {
    const img = new Image();
    img.src = imgUrl;

    let height: number;
    let width: number;
    let scaleFactor: number;

    img.onload = (event) => {
      const loadedImage = event.currentTarget as HTMLImageElement;
      height = loadedImage.height;
      width = loadedImage.width;
      scaleFactor = 1.0;

      // Check if image exceeds max height, if yes, adjust scale
      if (height >= this.maxImageHeight) {
        scaleFactor = this.maxImageHeight / loadedImage.height;
        height = this.maxImageHeight;
        width = loadedImage.width * scaleFactor;
      }

      // Check if image exceeds max width, if yes, adjust scale
      const maxWidth = Math.min(window.innerWidth, this.maxImageWidth)
      if (width >= maxWidth) {
        scaleFactor = scaleFactor * maxWidth / width;
        width = maxWidth;
        height = scaleFactor * loadedImage.height;
      }

      callback(height, width, scaleFactor);
    };
  }

  setCanvasProperties(context, lineWidth, lineCap, strokeStyle) {
    context.lineWidth = lineWidth;
    context.lineCap = lineCap;
    context.strokeStyle = strokeStyle;
  }

  drawRect(context: CanvasRenderingContext2D, bbox: BoundingBox, scaleFactor: number, color: string, fill: boolean = false, fillColor = "rgba(0, 0, 255, 0.3)") {
    this.setCanvasProperties(context, this.boxLineWidth, "square", color);
    context.beginPath();
    if (fill) {
      context.fillStyle = fillColor
      context.fillRect(
        bbox.left * scaleFactor,
        bbox.top * scaleFactor,
        bbox.width * scaleFactor,
        bbox.height * scaleFactor);
    } else {
      context.rect(
        bbox.left * scaleFactor,
        bbox.top * scaleFactor,
        bbox.width * scaleFactor,
        bbox.height * scaleFactor);
      context.stroke();
    }
  }

  topCenterText(context: CanvasRenderingContext2D, scaleFactor: number, text, color) {
    context.font = "bold 15pt Arial";
    context.lineWidth = 0.3;

    const metrics = context.measureText(text);
    const textWidth = metrics.width;

    const x = (context.canvas.width - textWidth) / 2;
    const y = 30;

    const padding = 8;

    context.fillStyle = "white";
    context.fillRect(x - padding, y - metrics.actualBoundingBoxAscent - padding, textWidth + (2 * padding), metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + (2 * padding));

    context.fillStyle = color;
    context.fillText(text, x, y);
  }

  addLabelToContext(context: CanvasRenderingContext2D, annotation: Annotation, scaleFactor: number, color: string,
                    firstBox: BoundingBox, annotations, drawMode: boolean = false) {
    context.font = "bold 15pt Arial";
    context.strokeStyle = "black";
    context.lineWidth = 0.3;

    let finalLabel: string = annotation.label;
    if (annotation.comment?.length > 0) {
      finalLabel = annotation.label + "**";
    }

    const textMetrics = context.measureText(finalLabel)
    const textWidth = textMetrics.width
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent

    //check for overlap with another label
    let overlap = annotations.some(otherAnnotation => {
      this.annotationOverlap(context, scaleFactor, annotation, otherAnnotation);
    })

    //fix out of bounds to the right side by shifting the label to the left as far as necessary
    let endPos = textMetrics.width + scaleFactor * annotation.labelLeft
    let xAdjustment = 0
    if (endPos > context.canvas.width) {
      xAdjustment = -1 * (endPos - context.canvas.width)
    }

    //fix out of bounds at the bottom or overlap with another label, by placing the label at the top of a box
    let bottomPos = textHeight + scaleFactor * annotation.labelTop + this.boxLineWidth + 4
    let yAdjustment = 0
    if (bottomPos > context.canvas.height || overlap) {
      yAdjustment = -1 * (scaleFactor * firstBox.height + textHeight + 20)
    }

    // calculate text positions
    let textX = scaleFactor * annotation.labelLeft + xAdjustment
    let textY = scaleFactor * annotation.labelTop + yAdjustment + this.boxLineWidth + 20

    // draw lines connecting label to boxes if there are multiple
    if (annotation.boxes.length > 1) {
      context.strokeStyle = color
      context.setLineDash([5, 5])
      annotation.boxes.forEach(box => {
        context.lineWidth = this.boxLineWidth * 0.5
        context.beginPath()
        context.moveTo(textX + textWidth * 0.5, textY)
        context.lineTo(box.left * scaleFactor, box.top * scaleFactor + box.height * scaleFactor)
        context.stroke()
      })
    }
    context.setLineDash([])

    //add white background to the text
    context.fillStyle = "white"
    if (drawMode) {
      context.fillStyle = color.replace(/[^,]+(?=\))/, "1");
    }
    const textBackgroundPadding = 4
    context.fillRect(textX - textBackgroundPadding * 0.5,
      textY - textHeight + textMetrics.actualBoundingBoxDescent - textBackgroundPadding * 0.5,
      textWidth + textBackgroundPadding,
      textHeight + textBackgroundPadding)

    //draw text
    context.fillStyle = color;
    if (drawMode) {
      context.fillStyle = "white"
    }
    context.fillText(finalLabel, textX, textY);

    annotation.labelLeft += xAdjustment * (1 / scaleFactor)
    annotation.labelTop += yAdjustment * (1 / scaleFactor)
  }

  //checks whether the text labels of two annotations overlap
  annotationOverlap(context, scaleFactor, anno_a, anno_b): boolean {
    if (anno_a.label == anno_b.label && anno_a.labelLeft == anno_b.labelLeft && anno_a.labelTop == anno_b.labelTop) return false
    let rectA = this.annotationToRectangle(context, scaleFactor, anno_a)
    let rectB = this.annotationToRectangle(context, scaleFactor, anno_b)
    return this.rectangleOverlap(rectA, rectB)
  }

  //Returns the rectangle object corresponding to an annotation
  annotationToRectangle(context, scalefactor, annotation): Rect {
    let metrics = context.measureText(annotation.label)
    const textWidth = metrics.width
    const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
    let topLeft: Point = {x: annotation.labelLeft * scalefactor, y: annotation.labelTop * scalefactor}
    let bottomRight: Point = {
      x: annotation.labelLeft * scalefactor + textWidth,
      y: annotation.labelTop * scalefactor + textHeight
    }
    return new Rect(topLeft, bottomRight)
  }

  //Checks whether two rectangles overlap, by seeing if either rectangle contains any of the others four vertices
  rectangleOverlap(rect_A, rect_B): boolean {
    let vsA = this.getRectangleVertices(rect_A)
    let vsB = this.getRectangleVertices(rect_B)
    return vsA.some(v => rect_B.contains(v)) || vsB.some(v => rect_A.contains(v))
  }

  //given a rect object returns a list of its 4 vertices
  getRectangleVertices(rect: Rect): Point[] {
    let vertices: Point[] = []
    vertices.push(rect.topLeft)
    vertices.push(rect.bottomRight)
    vertices.push({x: rect.topLeft.x, y: rect.bottomRight.y})
    vertices.push({x: rect.bottomRight.x, y: rect.topLeft.y})
    return vertices
  }


  // adds event listeners to given elements
  setImageZoomEventListeners(img: HTMLImageElement, lensElement, lensSize, zoomLayerElement, zoomDivElement) {
    // calculate ratio between result div and lens
    const widthRatio = zoomDivElement.offsetWidth / lensElement.offsetWidth;
    const heightRatio = zoomDivElement.offsetHeight / lensElement.offsetHeight;
    // Set background properties for the result div
    zoomDivElement.style.backgroundImage = "url('" + img.src + "')";
    zoomDivElement.style.backgroundSize = (img.width * widthRatio) + "px " + (img.height * heightRatio) + "px";

    // Function to handle mouse move events
    const handleMouseMove = (e: MouseEvent) => {
      this.imageZoomOnMousemove(e, widthRatio, heightRatio, img, lensElement, lensSize, zoomLayerElement, zoomDivElement);
    };
    // Remove previous EventListeners, important for mode change
    lensElement.removeEventListener("mousemove", handleMouseMove);
    zoomLayerElement.removeEventListener("mousemove", handleMouseMove);

    // Execute a function when someone moves the cursor over the image or the lens
    lensElement.addEventListener("mousemove", handleMouseMove)
    zoomLayerElement.addEventListener("mousemove", handleMouseMove)
  }

  // event listener function for image zoom using divs
  imageZoomOnMousemove(event, cx, cy,
                       img: HTMLImageElement, lensElement, lensSize, zoomLayerElement, zoomDivElement) {
    let x;
    let y;
    // Prevent any other actions that may occur when moving over the image
    event.preventDefault();
    // Get the cursor's x and y positions:
    const pos = this.getCursorPosInImage(event, img);
    // Calculate the position of the lens:
    x = pos.x - (lensElement.offsetWidth / 2);
    y = pos.y - (lensElement.offsetHeight / 2);
    // Prevent the lens from being positioned outside the image:
    if (x > img.width - lensElement.offsetWidth) {
      x = img.width - lensElement.offsetWidth;
    }
    x = Math.max(x, 0)
    if (y > img.height - lensElement.offsetHeight) {
      y = img.height - lensElement.offsetHeight;
    }
    y = Math.max(y, 0)

    // Set the position of the lens:
    lensElement.style.left = x + "px";
    lensElement.style.top = y + "px";

    // set lens display / zoomDiv position
    // first get center coordinates of the lens
    const centerX = x + lensSize / 2;
    const centerY = y + lensSize / 2;

    // then use zoomDiv Size (hard coded) to compute top and left TODO: Make non hard-coded
    let zoomDivX = centerX - 125;
    let zoomDivY = centerY - 125;

    // apply constraints on position: not less than 0 and not more than image height and width
    zoomDivX = Math.min(Math.max(zoomDivX, 0), img.width - 250);
    zoomDivY = Math.min(Math.max(zoomDivY, 0), img.height - 250);

    zoomDivElement.style.left = zoomDivX + "px";
    zoomDivElement.style.top = zoomDivY + "px";
    // Display what the lens "sees":
    zoomDivElement.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
  }

  // returns the cursor coordinates within an image
  getCursorPosInImage(event, img: HTMLImageElement) {
    let x: number;
    let y: number;
    // Get the x and y positions of the image
    const a = img.getBoundingClientRect();
    // Calculate the cursor's x and y coordinates, relative to the image:
    x = event.pageX - a.left;
    y = event.pageY - a.top;
    // Consider any page scrolling
    x = x - window.scrollX;
    y = y - window.scrollY;
    return {x, y};
  }

}

// a class representing the bounding box of a text label
export class Rect {
  topLeft: Point
  bottomRight: Point

  constructor(topLeft: Point, bottomRight: Point) {
    this.topLeft = topLeft
    this.bottomRight = bottomRight
  }

  contains(p: Point): boolean {
    return (
      p.x >= this.topLeft.x &&
      p.x <= this.bottomRight.x &&
      p.y >= this.topLeft.y &&
      p.y <= this.bottomRight.y
    );
  }

}

export type Point = {
  x: number
  y: number
}

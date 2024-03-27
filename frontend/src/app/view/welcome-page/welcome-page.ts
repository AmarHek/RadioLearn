import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {BackendService, DisplayService, RadiolearnService} from "@app/core";
import {environment} from "@env/environment";
import {getResetCounter, getUUID} from "@app/core/helpers/localStorageHelper";
import {MatDialog} from "@angular/material/dialog";
import {DialogNoMaterialsComponent} from "@app/shared/dialog-no-materials/dialog-no-materials.component";

@Component({
  selector: "app-welcome-page",
  templateUrl: "./welcome-page.html",
  styleUrls: ["./welcome-page.scss"]
})
export class WelcomePage implements OnInit {

  // assetsUrl = environment.assets;
  assetsUrl = "assets/img/";

  isMobile = false;
  private UUID = "undefined";

  constructor(
    private radiolearnService: RadiolearnService,
    private router: Router,
    private backendCaller: BackendService,
    private displayService: DisplayService,
    private dialog: MatDialog
) {  }

  ngOnInit(): void {
    this.UUID = getUUID();
    this.displayService.isMobile.subscribe(res => {
       this.isMobile = res;
    });
  }

  deepMode() {
    this.radiolearnService.drawMode = false;
    this.radiolearnService.workMode = "deep";
    this.loadUnused("deep");
  }

  shallowMode() {
    this.radiolearnService.drawMode = false;
    this.radiolearnService.workMode = "shallow";
    this.loadUnused("shallow");
  }

  annotationMode() {
    this.radiolearnService.drawMode = true;
    this.radiolearnService.workMode = "shallow";
    this.loadUnused("shallow");
  }

  openEditor(matID: string) {
    this.router.navigate(["/", "main", matID]).then();
  }

  loadUnused(mode: string){
    this.backendCaller.getUnusedMaterial(this.UUID, mode, getResetCounter()).subscribe(res => {
      console.log(res);
      if (res.material === null) {
        this.dialog.open(DialogNoMaterialsComponent)
      } else {
        this.router.navigate(["/", "main", res.material._id]);
      }
    }, err => {
      console.log(err);
    });
  }

}

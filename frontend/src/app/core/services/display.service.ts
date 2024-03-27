import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import { Injectable } from "@angular/core";
import {Router} from "@angular/router";
import {BehaviorSubject} from "rxjs";

const NAVBAR_HEADER_TOGGLE_1 = "main";
const NAVBAR_HEADER_TOGGLE_2 = "login";

@Injectable({
  providedIn: "root"
})
export class DisplayService {

  // TODO: Do something with layouts so all possible layouts are contained in a template-list, perhaps dropdown menu

  displayHeader: boolean;
  title: string;

  currentScreenSize: string;
  isMobile: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  displayNameMap = new Map([
    [Breakpoints.XSmall, "XSmall"],
    [Breakpoints.Small, "Small"],
    [Breakpoints.Medium, "Medium"],
    [Breakpoints.Large, "Large"],
    [Breakpoints.XLarge, "XLarge"],
  ]);

  constructor(private router: Router,
              private breakPointObserver: BreakpointObserver) {
    this.displayHeader = true;
    breakPointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge
    ]).subscribe(result =>{
      for (const query of Object.keys(result.breakpoints)){
        if(result.breakpoints[query]){
          this.currentScreenSize = this.displayNameMap.get(query) ?? "Unknown";
          this.isMobile.next(this.currentScreenSize === "Small" || this.currentScreenSize === "XSmall");
        }
      }
    });
  }

  update() {
    this.updateDisplay();
  }

  private updateDisplay() {
    this.displayHeader = !(this.router.url.includes(NAVBAR_HEADER_TOGGLE_1) ||
      this.router.url.includes(NAVBAR_HEADER_TOGGLE_2));
  }

}

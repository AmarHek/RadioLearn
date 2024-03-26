import {CommonModule} from "@angular/common";
import {NgModule, Optional, SkipSelf} from "@angular/core";
import {
  AuthenticationService,
  BackendService,
  DataParserService,
  DisplayService,
  FilesSortingService,
  ImageDisplayService,
  InputParserService,
  MatDialogService,
  RadiolearnService,
  UserService
} from "@app/core";


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    AuthenticationService,
    BackendService,
    DataParserService,
    DisplayService,
    FilesSortingService,
    ImageDisplayService,
    InputParserService,
    MatDialogService,
    RadiolearnService,
    UserService
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() core: CoreModule) {
    if(core) {
      throw new Error("No");
    }
  }
}

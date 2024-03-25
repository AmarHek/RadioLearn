import { Injectable } from "@angular/core";
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from "@angular/common/http";
import { Observable } from "rxjs";

import { environment } from "@env/environment";
import { AuthenticationService } from "@app/core/services/authentication.service";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add auth header with jwt if user is logged in and request is to api url
    const user = this.authenticationService.userValue;
    const isLoggedIn = user && user.accessToken;
    const isApiUrl = request.url.startsWith(environment.backend);
    if (isLoggedIn && isApiUrl) {
      request = request.clone({
        setHeaders: {
          authorization: `${user.accessToken}`
        }
      });
    }

    return next.handle(request);
  }
}

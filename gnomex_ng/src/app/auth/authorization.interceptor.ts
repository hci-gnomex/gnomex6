import {Injectable, Injector, isDevMode} from "@angular/core";
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpHeaders} from "@angular/common/http";

import {Observable} from "rxjs";
import {AuthenticationService} from "./authentication.service";
import {of} from "rxjs";
import {catchError} from "rxjs/operators";

@Injectable()
export class AuthorizationInterceptor implements HttpInterceptor {

  constructor(private injector: Injector) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (isDevMode()) {
      console.debug("AuthorizationInterceptor.intercept");
    }

    let authService: AuthenticationService = this.injector.get(AuthenticationService);
    let headers: HttpHeaders = authService.getHeaders(req);
    let url: string = req.url;
    if (url.startsWith("/")) {
      url = authService.getBaseUrl() + url;
    } else if (!url.startsWith("http")) {
      if (authService.getContextRoot().length > 0) {
        url = authService.getBaseUrl() + "/" + authService.getContextRoot() + "/" + url;
      } else {
        url = authService.getBaseUrl() + "/" + url;
      }
    }

    let reqClone = req.clone({
      url: url,
      withCredentials: true,
      headers: headers
    });

    return next.handle(reqClone).pipe(
      catchError((error) => {
        if (isDevMode()) {
          console.error("AuthorizationInterceptor.error");
          console.error(error);
        }

        /**
         * If the token is not authenticated which angular does not know about, then a REST request to the backend will
         * return a 401.  To duplicate this, open Core in two tabs.  In one tab, logout, in the other, perform a request
         * that hits a protected resource.
         */
        if (error.status === 401) {
          authService.isAuthenticated().subscribe((authenticated) => {
            if (authenticated) {
              // If authenticated, then logout which will redirect.
              authService.logout(true);
              return of(error.message);
            } else {
              // Otherwise, for example, when the user first opens Core, 401s are expected.
              return Observable.throw(error);
            }
          });
        }
        if (error.status === 403) {
          // TODO: Trigger notification for unauthorized.
        }
        return Observable.throw(error);
      }));
  }
}

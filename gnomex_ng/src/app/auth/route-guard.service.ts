import {Injectable, Inject} from "@angular/core";
import {CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";

import {Observable, throwError} from "rxjs";

import {AuthenticationService, AUTHENTICATION_ROUTE} from "./authentication.service";
import {catchError, map} from "rxjs/operators";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

/**
 * A {@code CanActivate} implementation which makes its calculation based on the current authentication state.
 *
 * @since 1.0.0
 */
@Injectable()
export class RouteGuardService implements CanActivate {

  constructor(private _authenticationService: AuthenticationService,
              private _router: Router,
              @Inject(AUTHENTICATION_ROUTE) private _authenticationRoute: string) {
  }

  /**
   * Determines whether or not a route can be activated, based on the current authentication state.
   *
   * @param route for activation to be determined on
   * @param state of the router snapshot
   * @returns {Observable<boolean>} describing the result of this calculation
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this._authenticationService.isAuthenticated().pipe(map((authenticated) => {
      if (!authenticated) {
        // Store the attempted URL for redirecting
        this._authenticationService.redirectUrl = state.url;

        // Navigate to the login page
        this._router.navigate([this._authenticationRoute]);
      }

      return authenticated;
    }, (error: any) => {
      return false;
    }), catchError((err: IGnomexErrorResponse) => {
      return throwError(err);
    }));
  }
}


import {
    ActivatedRoute,
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
} from "@angular/router";
import {BehaviorSubject, Observable, of} from "rxjs";
import {Injectable} from "@angular/core";
import {GnomexService} from "../gnomex.service";
import {HttpParams} from "@angular/common/http";
import {AuthenticationService} from "../../auth/authentication.service";
import {catchError, flatMap, map} from "rxjs/operators";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";
import {PropertyService} from "../property.service";
import {NavigationService} from "../navigation.service";

/**
 * A {@code CanActivate} implementation which makes its calculation based on the current authentication state.
 *
 * @since 1.0.0
 *
 */
@Injectable()
export class AuthRouteGuardService implements CanActivate {


    constructor(private _authenticationService: AuthenticationService,
                private _router: Router,
                private route: ActivatedRoute,
                private navService: NavigationService,
                private gnomexService: GnomexService
    ) {

    }

    /**
     * Determines whether or not a route can be activated, based on the current authentication state.
     *
     * @param route for activation to be determined on
     * @param state of the router snapshot
     * @returns {Observable<boolean>} describing the result of this calculation
     */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        if (this._authenticationService.isGuestMode() || this.gnomexService.isGuestState ) {
            return of(true);
        }

        let paramNumb: number = Object.keys(route.queryParams).length;


        return this._authenticationService.isAuthenticated()
            .pipe(flatMap(auth => {
                // Store the attempted URL for redirecting
                this._authenticationService.redirectUrl = state.url;
                if (paramNumb > 0) {
                    return this.determineIfPublic(route.queryParams, auth, state.url)
                } else {
                    if (!auth) {
                        // Store the attempted URL for redirecting
                        this._authenticationService.redirectUrl = state.url;
                        // Navigate to the login page
                        this._router.navigate(["authenticate"]);
                    }
                    return of(auth);
                }
            }));

    }


    private redirectByURL(params: HttpParams, isNoPublicVis: boolean,  isAuthed: boolean, numberObj: any): Observable<boolean> {
        return this.gnomexService.getOrderFromNumber(params).pipe(map((res) => {
            this.setIDsFromResponse(res, numberObj); // no navigation
            this.gnomexService.orderInitObj = numberObj;


            if (isAuthed && !(res.codeVisbility === "PUBLIC")) { //allow them to route, but backend will not show order if not permitted access(flex approach)
                numberObj["isGuest"] = false;
                return true;
            } else if(!isAuthed && !(res.codeVisbility === "PUBLIC") ) { //the order isn't public and they haven't signed in. Make them sign in
                this._router.navigate(["authenticate"]);
                return false;
            } else { // order is public
                numberObj["isGuest"] = !isAuthed;
                if(isNoPublicVis) {
                    // do not let them route since backend will let them see public data if not
                    this._authenticationService.redirectUrl = "/home";
                    this.gnomexService.redirectURL = null;
                    this._router.navigate(["authenticate"]);
                    this.gnomexService.orderInitObj = null;

                    return false;
                } else {
                    if(!isAuthed){
                        this._authenticationService.guestLogin();
                    }
                    return true;
                }

            }

        }), catchError( (err: IGnomexErrorResponse) => {
            this._router.navigate(["authenticate"]);
            return of(false);
        }));

    }

    private determineIfPublic(queryParam: any, isAuthed: boolean, url: string): Observable<boolean> {
        return this.gnomexService.getLoginPropertiesObservable().pipe(flatMap((loginPropResp: any) => {
            let noPublicVis: boolean = loginPropResp[PropertyService.PROPERTY_NO_PUBLIC_VISIBILITY];

            let numberObj: any = {};
            if (queryParam["requestNumber"]) {
                numberObj["type"] = "requestNumber";
                numberObj["value"] = queryParam["requestNumber"];
                numberObj["urlSegList"] = ["experiments"];
                let params: HttpParams = new HttpParams().set(numberObj.type, numberObj.value);
                return this.redirectByURL(params, noPublicVis, isAuthed, numberObj);


            } else if (queryParam["analysisNumber"]) {
                numberObj["type"] = "analysisNumber";
                numberObj["value"] = queryParam["analysisNumber"];
                numberObj["urlSegList"] = ["analysis"];
                let params: HttpParams = new HttpParams().set(numberObj.type, numberObj.value);
                return this.redirectByURL(params, noPublicVis, isAuthed, numberObj);

            } else if (queryParam["dataTrackNumber"]) {
                numberObj["type"] = "dataTrackNumber";
                numberObj["value"] = queryParam["dataTrackNumber"];
                numberObj["urlSegList"] = ["datatracks"];
                let params: HttpParams = new HttpParams().set(numberObj.type, numberObj.value);
                return this.redirectByURL(params, noPublicVis, isAuthed, numberObj);

            } else if (queryParam["topicNumber"]) {
                numberObj["type"] = "topicNumber";
                numberObj["value"] = queryParam["topicNumber"];
                numberObj["urlSegList"] = ["topics"];
                let params: HttpParams = new HttpParams().set(numberObj.type, numberObj.value);
                return this.redirectByURL(params, noPublicVis, isAuthed, numberObj);


            } else {
                return of(false);
            }

        }), catchError((err: IGnomexErrorResponse) => {
            return of(false);
        }));

    }

    private setIDsFromResponse(resp: any, orderInfo: any) {
        let idList: Array<any> = Object.keys(resp);
        for (let idKey  of idList) {
            if (idKey === "result" || idKey === "codeVisbility") {
                continue;
            } else {
                orderInfo[idKey] = resp[idKey];
            }
        }

        if (orderInfo) {
            this.gnomexService.redirectURL = this.navService.makeURL(orderInfo);
        }

    }

}

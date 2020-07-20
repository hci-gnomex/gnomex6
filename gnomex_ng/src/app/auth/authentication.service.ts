import {Injectable, InjectionToken, Inject, Optional, isDevMode} from "@angular/core";
import {LocationStrategy} from "@angular/common";
import {Router} from "@angular/router";
import {HttpClient, HttpHeaders, HttpParams, HttpRequest, HttpResponse} from "@angular/common/http";

import {Observable, BehaviorSubject, Subscription, interval, of, throwError} from "rxjs";
import {CoolLocalStorage} from "angular2-cool-storage";
import {JwtHelperService} from "@auth0/angular-jwt";

import {AuthenticationProvider} from "./authentication.provider";
import {catchError, first, map} from "rxjs/operators";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {DictionaryService} from "../services/dictionary.service";
import {CookieUtilService} from "../services/cookie-util.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {GnomexService} from "../services/gnomex.service";
import {ProgressService} from "../home/progress.service";

/**
 * The token used for injection of the server side endpoint for the currently authenticated subject.
 *
 * @type {InjectionToken}
 */
export let AUTHENTICATION_SERVER_URL = new InjectionToken<string>("authentication_server_rest_api");
export let AUTHENTICATION_LOGOUT_PATH = new InjectionToken<string>("authentication_logout_path");
export let AUTHENTICATION_DIRECT_ENDPOINT = new InjectionToken<string>("authentication_direct_endpoint");
export let AUTHENTICATION_TOKEN_ENDPOINT = new InjectionToken<string>("authentication_token_endpoint");
export let AUTHENTICATION_ROUTE = new InjectionToken<string>("authentication_route");
export let AUTHENTICATION_MAX_INACTIVITY_MINUTES = new InjectionToken<number>("authentication_max_inactivity");
export let AUTHENTICATION_USER_COUNTDOWN_SECONDS = new InjectionToken<number>("authentication_user_countdown_seconds");
export let AUTHENTICATION_IDP_INACTIVITY_MINUTES = new InjectionToken<number>("authentication_idp_inactivity_minutes");

/**
 * @since 1.0.0
 */
@Injectable()
export class AuthenticationService {

    /**
     * The generic error message used when a server error is thrown without a status.
     *
     * @type {string}
     */
    public static GENERIC_ERR_MSG: string = "Server error";

    private static CONTENT_TYPE: string = "Content-Type";
    private static CHARSET: string = "charset";
    private static SEC_GOV_CLASS_HEADER: string = "SecurityGovernorClass";
    private static SEC_GOV_ID_HEADER: string = "SecurityGovernorId";
    private static DEIDENT_HEADER: string = "DeidentifiedContext";
    private static LIMITED_HEADER: string = "LimitedContext";

    public userCountdownSeconds: number = 60;
    public idpInactivityMinutes: number = 5;

    public contentType: string = "application/json";
    public charsetUTF_8: string = "charset=UTF-8";
    public securityGovernorClass: string = null;
    public securityGovernorId: number = null;
    public limitedContext: boolean = false;
    public deidentifiedContext: boolean = false;

    private _isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private _isGuestMode: boolean = false;
    private _userIsAboutToTimeOut: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private _redirectUrl: string;
    private _refreshSubscription: Subscription;
    private _timeoutSubscription: Subscription;
    private _tokenActivitySubscription: Subscription;
    private _lastUserInteraction: Date;
    private _maxInactivityMinutes: number = 120;

    private baseUrl: string;
    private contextRoot: string = "";

    private checkSessionStatusInterval: any;
    private checkSessionStatusDialogIsOpen: boolean = false;

    private _hasLoggedOut: boolean = true;

    public get hasLoggedOut() {
        return this._hasLoggedOut;
    }

    constructor(private _http: HttpClient,
                private _router: Router,
                private _localStorageService: CoolLocalStorage,
                private _jwtHelper: JwtHelperService,
                private authenticationProvider: AuthenticationProvider,
                private dictionaryService: DictionaryService,
                private cookieUtilService: CookieUtilService,
                private dialogService: DialogsService,
                private progressService: ProgressService,
                @Inject(AUTHENTICATION_ROUTE) private _authenticationRoute: string,
                @Inject(AUTHENTICATION_LOGOUT_PATH) private _logoutPath: string,
                @Inject(AUTHENTICATION_TOKEN_ENDPOINT) private _tokenEndpoint: string,
                @Optional() @Inject(AUTHENTICATION_SERVER_URL) private _serverUrl: string,
                @Optional() @Inject(AUTHENTICATION_DIRECT_ENDPOINT) private _directEndpoint: string,
                @Optional() @Inject(AUTHENTICATION_MAX_INACTIVITY_MINUTES) private _maxInactivity: number,
                @Optional() @Inject(AUTHENTICATION_USER_COUNTDOWN_SECONDS) private _userCountdownSeconds: number,
                @Optional() @Inject(AUTHENTICATION_IDP_INACTIVITY_MINUTES) private _idpInactivityMinutes: number,
                @Optional() @Inject(LocationStrategy) private locationStrategy: LocationStrategy) {

        if (isDevMode()) {
            console.debug("window.location.href: " + window.location.href);
        }
        if (window.location) {
            let parts: string[] = window.location.href.split("/");
            this.baseUrl = parts[0] + "//" + parts[2];
            if (parts.length > 3) {
                this.contextRoot = parts[3];
            }
        }

        if (_maxInactivity != null) {
            this._maxInactivityMinutes = _maxInactivity;
        }

        if (_userCountdownSeconds != null) {
            this.userCountdownSeconds = _userCountdownSeconds;
        }

        if (_idpInactivityMinutes != null) {
            this.idpInactivityMinutes = _idpInactivityMinutes;
        }

        this.hasValidConfig();

        this.subscribeToTokenActivity();

        //There could be a non-expired token in local storage.
        let token: string = this.authenticationProvider.authToken;
        this.storeToken(token);
    }

    getBaseUrl(): string {
        return (this.baseUrl) ? this.baseUrl : "";
    }

    getContextRoot(): string {
        return this.contextRoot;
    }

    getHeaders(req: HttpRequest<any>): HttpHeaders {
        let headers: HttpHeaders = req.headers;

        //Don't set content type if already set
        if (req.headers.get(AuthenticationService.CONTENT_TYPE) === null) {
            //Set content-type as application/json and charset as UTF-8 except when the body of request is FormData;
            //httpClient POST/PUT calls let the browser handle contentTyep for multipart/form-data contentType.
            if(!(req.serializeBody() instanceof FormData)) {
                let contentType = this.contentType;
                if(!(req.responseType.toLocaleLowerCase() === "blob")) {
                    contentType = contentType + "; " + this.charsetUTF_8;
                }
                headers = headers.set(AuthenticationService.CONTENT_TYPE, contentType.toString());
            }
        } else {
            if(!(req.responseType.toLocaleLowerCase() === "blob")) {
                let contentType = req.headers.get(AuthenticationService.CONTENT_TYPE);
                if(!contentType.includes(AuthenticationService.CHARSET)) {
                    contentType = contentType + "; " + this.charsetUTF_8;
                    headers = headers.set(AuthenticationService.CONTENT_TYPE, contentType.toString());
                }
            }
        }

        if (this.securityGovernorClass !== null) {
            headers = headers.set(AuthenticationService.SEC_GOV_CLASS_HEADER, this.securityGovernorClass);
        }
        if (this.securityGovernorId !== null) {
            headers = headers.set(AuthenticationService.SEC_GOV_ID_HEADER, this.securityGovernorId.toString());
        }
        headers = headers.set(AuthenticationService.DEIDENT_HEADER, this.deidentifiedContext.toString());
        headers = headers.set(AuthenticationService.LIMITED_HEADER, this.limitedContext.toString());

        return headers;
    }

    get authenticationTokenKey(): string {
        return this.authenticationProvider.authenticationTokenKey;
    }

    get authToken(): string {
        return this.authenticationProvider.authToken;
    }

    public updateUserActivity(): void {
        this._lastUserInteraction = new Date();
        this._userIsAboutToTimeOut.next(false);
        this.unsubscribeFromTimout();

        //Only taking the first value of the subscription. A new subscription will be created when a new token is stored.
        this._timeoutSubscription = interval(((this._maxInactivityMinutes * 60) - this.userCountdownSeconds) * 1000)
            .pipe(first())
            .subscribe((value) => {
                this._userIsAboutToTimeOut.next(true);
            });
    }

    /**
     * A mutator for identifying the clients original request location. Setting this value will influence the end location
     * navigated to by {@link #navigateToPath}.
     *
     * @param redirectUrl location of the users request before authentication
     */
    set redirectUrl(redirectUrl: string) {
        this._redirectUrl = redirectUrl;
    }

    get redirectUrl() {
        return this._redirectUrl;
    }

    public findAppUserByUsername(username: string): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        let params: HttpParams = new HttpParams().set("UID", username);
        return this._http.get("/gnomex/CheckIsGNomExAccount.gx", {params: params})
    }

    public requestAccessToken(redirectOnSuccess: boolean): void {
        this.unsubscribeFromTokenActivity();
        this._hasLoggedOut = false;

        this._http.get(this.tokenLocation(), {withCredentials: true})
            .subscribe(
                (response: any) => {
                    this.storeToken(response.auth_token);
                    if (redirectOnSuccess) {
                        this.proceedIfAuthenticated();
                    }
                    this.subscribeToTokenActivity();

                    if (!this.checkSessionStatusInterval) {
                        this.checkSessionStatusInterval = setInterval(() => { this.checkSessionStatus(); }, 10000);
                    }
                },
                (err: IGnomexErrorResponse) => {
                    //Token refresh failed.
                    this.logout(true);
                }
            );
    }

    private checkSessionStatus(): void {
        this.cookieUtilService.formatXSRFCookie();
        this._http.post("/gnomex/CheckSessionStatus.gx", {}).subscribe((response: any) => {
            // Do nothing.
        }, (error: any) => {
            if (!this.checkSessionStatusDialogIsOpen) {
                this.checkSessionStatusDialogIsOpen = true;

                this.dialogService.confirm("Your session has expired, and you have lost connection to the server.  Would you like to return to the login screen now?", "Disconnected...").pipe(first()).subscribe((result: boolean) => {
                    if(result) {
                        this.logout();
                        this.progressService.hideLoaderStatus(false);
                        this.progressService.loaderStatus = new BehaviorSubject<number> (0);
                        this._router.navigate(["/logout-loader"]);
                    }

                    this.checkSessionStatusDialogIsOpen = false;
                });
            }

        });
    }

    /**
     * Verifies whether or not a current user session exists.
     *
     * @returns {Observable<boolean>} evaluates to true if the user is authenticated, false otherwise.
     */
    isAuthenticated(): Observable<boolean> {
        return this._isAuthenticatedSubject.asObservable();
    }

    isGuestMode(): boolean {
        return this._isGuestMode;
    }

    isAboutToTimeOut(): Observable<boolean> {
        return this._userIsAboutToTimeOut.asObservable();
    }

    tokenLocation(): string {
        if (this._serverUrl) {
            return this._serverUrl + this._tokenEndpoint;
        } else {
            return this._tokenEndpoint;
        }
    }

    directLoginLocation(): string {
        if (this._serverUrl) {
            return this._serverUrl + this._directEndpoint;
        } else {
            return this._directEndpoint;
        }
    }

    logoutLocation(): string {
        if (this._serverUrl) {
            return this._serverUrl + this._logoutPath;
        } else {
            return this._logoutPath;
        }
    }

    /**
     * A function to authenticated the user with the provided credentials. Failure results in an error that describes the
     * server response (status and status message) and should be actionable by the client application.
     *
     * @param _username of the authenticating user to verify
     * @param _password of the authenticating user to verify
     * @returns {Observable<R>} describing the result of the login action, true or an error
     */
    login(_username: string, _password: string): Observable<boolean> {
        this._isGuestMode = false;
        let username = _username;
        return this._http.post(
            this.directLoginLocation(),
            {username: _username, password: _password},
            {observe: "response"}
        ).pipe(map((resp: HttpResponse<any>) => {
            if (resp.status === 201) {
                return true;
            } else {
                throw new Error("Authentication failed. " + resp.status + ": " + resp.statusText);
            }
        }), catchError((err: IGnomexErrorResponse) => {
            return throwError(err);
        }));
    }

    guestLogin(): void {
        this._isGuestMode = true;
        this._hasLoggedOut = false;
    }


    clearLogin(): Observable<Response> {
        //Front-end logout
        try {
            this._hasLoggedOut = true;
            this._localStorageService.removeItem(this.authenticationProvider.authenticationTokenKey);
            this.unsubscribeFromTokenRefresh();
            this.unsubscribeFromTimout();
            this._isAuthenticatedSubject.next(false);
            this._isGuestMode = false;
            this._userIsAboutToTimeOut.next(false);
        } catch (Error) {
        }

        //Back-end logout
        let headers = new HttpHeaders().set(AuthenticationService.CONTENT_TYPE, "text/plain");
        return <Observable<Response>>this._http.get(this.logoutLocation(), {headers: headers});
    }

    /**
     * A function to signal the termination of the current session. Invoking this function will clean up any relevant state
     * related to the last active session.
     */
    logout(keepCurrentRoute: boolean = false): void {
        //Prevent logout if already on authentication route. Doing otherwise screws up SAML
        if (!this._router.routerState || this._router.routerState.snapshot.url !== this._authenticationRoute) {
            clearInterval(this.checkSessionStatusInterval);
            this.checkSessionStatusInterval = null;
            this._hasLoggedOut = true;

            this._redirectUrl = (keepCurrentRoute && this._router.routerState != null && this._router.routerState.snapshot != null) ? this._router.routerState.snapshot.url : "";

            if (this._redirectUrl.startsWith("/")) {
                this._redirectUrl = this._redirectUrl.substring(1);
            }

            this.clearLogin().subscribe(
                (response) => {
                    //window.location.replace(this._redirectUrl);
                },
                (err: IGnomexErrorResponse) => {
                    window.location.replace(this._redirectUrl);
                }
            );
        }
    }

    storeToken(token: string): void {
        let valid = this.validateToken(token);

        if (valid) {
            this._localStorageService.setItem(this.authenticationProvider.authenticationTokenKey, token);
            this.subscribeToTokenRefresh(token);

            //Change the BehaviorSubject if the user was not previously authenticated.
            //Since other code may be subscribing to this observable, we don't want to cause new events to fire if just refreshing the JWT.
            if (!this._isAuthenticatedSubject.value) {
                this._isAuthenticatedSubject.next(true);
            }
        } else {
            this._localStorageService.removeItem(this.authenticationProvider.authenticationTokenKey);
            this._isAuthenticatedSubject.next(false);
            this.unsubscribeFromTokenRefresh();
        }
    }

    proceedIfAuthenticated(): boolean {
        if (isDevMode()) {
            console.debug("AuthenticationService.proceedIfAuthenticated: " + this._redirectUrl);
        }

        if (this._isAuthenticatedSubject.value) {
            //Login counts as user activity, too
            this.updateUserActivity();

            if (this._redirectUrl && this._redirectUrl !== null && this._redirectUrl !== "") {
                this._router.navigateByUrl(this._redirectUrl);
            } else {
                this._router.navigate([""]);
            }

            return true;
        } else {
            return false;
        }
    }

    validateToken(token: string): boolean {
        return (token !== null && !this._jwtHelper.isTokenExpired(token));
    }

    subscribeToTokenRefresh(token: any): void {
        //Refresh 60 seconds before expiry
        let exp = this._jwtHelper.getTokenExpirationDate(token);
        let msToExpiry = (exp.valueOf() - new Date().valueOf());

        //Only taking the first value of the subscription. A new subscription will be created when a new token is stored.
        this._refreshSubscription = interval((msToExpiry > 60000) ? msToExpiry - 60000 : 0)
            .pipe(first())
            .subscribe((value) => {
                this.refreshTokenIfUserIsActive();
            });
    }

    subscribeToTokenActivity(): void {
        this._tokenActivitySubscription = this.authenticationProvider.authTokenActivity.subscribe((activity: boolean) => {
            if (isDevMode()) {
                console.debug("AuthenticationService.authTokenActivity.subscribe: " + activity);
            }
            if (this._isAuthenticatedSubject.value) {
                this.updateUserActivity();
            }
        });
    }


    unsubscribeFromTokenRefresh(): void {
        if (this._refreshSubscription != null && !this._refreshSubscription.closed) {
            this._refreshSubscription.unsubscribe();
        }
    }

    private unsubscribeFromTimout(): void {
        //Unsubscribe from any old timeout subscription
        if (this._timeoutSubscription != null && !this._timeoutSubscription.closed) {
            this._timeoutSubscription.unsubscribe();
        }
    }

    private unsubscribeFromTokenActivity(): void {
        if (this._tokenActivitySubscription != null && !this._tokenActivitySubscription.closed) {
            this._tokenActivitySubscription.unsubscribe();
        }
    }

    private refreshTokenIfUserIsActive(): void {
        //Only refresh if the user has been active
        if (this._lastUserInteraction != null && ((new Date().valueOf() - this._lastUserInteraction.valueOf()) <= (this._maxInactivityMinutes * 60 * 1000))) {
            this.requestAccessToken(false);
        }
    }

    private hasValidConfig(): void {
        if (this._tokenEndpoint == null && (this._serverUrl == null || this._logoutPath == null)) {
            throw new Error("BUG ALERT! Invalid AuthenticationService configuration. No valid configuration for authentication endpoint(s).");
        }
        if (this._localStorageService == null || this.authenticationProvider.authenticationTokenKey == null) {
            throw new Error("BUG ALERT! Invalid AuthenticationService configuration. No valid configuration for local storage");
        }
    }

    private handleError(error: any) {
        let errMsg = (error.message) ? error.message : AuthenticationService.GENERIC_ERR_MSG;
        return throwError(errMsg);
    }
}

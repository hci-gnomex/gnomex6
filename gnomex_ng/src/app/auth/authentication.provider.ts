import {Inject, Injectable, InjectionToken, Injector} from "@angular/core";

import {Subject} from "rxjs/Subject";

import {CoolLocalStorage} from "angular2-cool-storage";

export let AUTHENTICATION_TOKEN_KEY = new InjectionToken<string>("authentication_token_key");

@Injectable()
export class AuthenticationProvider {

  public whitelistedDomains = [
    "localhost",
    new RegExp(".*[.]utah[.]edu")
  ];

  private _authTokenActivity: Subject<boolean> = new Subject<boolean>();

  constructor(private _localStorageService: CoolLocalStorage,
              @Inject(AUTHENTICATION_TOKEN_KEY) private _authenticationTokenKey: string) {}

  public tokenGetter = () => {
    return this.authToken;
  };

  get authenticationTokenKey(): string {
    return this._authenticationTokenKey;
  }

  set authenticationTokenKey(_authenticationTokenKey: string) {
    this._authenticationTokenKey = _authenticationTokenKey;
  }

  get authTokenActivity(): Subject<boolean> {
    return this._authTokenActivity;
  }

  get authToken(): string {
    this._authTokenActivity.next(true);

    return <string>this._localStorageService.getItem(this._authenticationTokenKey);
  }

}

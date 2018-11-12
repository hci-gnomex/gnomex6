import {Component, ElementRef, ViewChild, Inject} from "@angular/core";
import {Location, PopStateEvent} from '@angular/common';
import {Router} from "@angular/router";
import {DomSanitizer} from "@angular/platform-browser";
import {Observable, Subscription} from "rxjs";

import {AuthenticationService, AUTHENTICATION_ROUTE} from "./authentication.service";

@Component({
  selector: "authentication-iframe",
  template: `
    <div class="container">
      <iframe #iframe class="frame" [src]="url" (load)="handleChanges()"></iframe>
      <div *ngIf="_errorMsg" class="alert-box">
        <div class="alert alert-danger">
          <h5 class="alert-heading">Authentication Failed</h5>
          <span id="hci-login-error" class="alert-text">{{_errorMsg}}</span>
        </div>
      </div>
    </div>
    `,
  styles: [`
    .container {
      max-width: 400px;
      margin-top: 20px;
      padding-top: 15px;
    }

    .frame {
      width: 400px;
      height: 400px;
      border: 0px;
    }
  `],
  host: {class: "mx-auto"}
})
export class AuthenticationComponent {

  public url;
  public _errorMsg: string;

  @ViewChild("iframe") iframe : ElementRef;

  private resetSubscription: Subscription;
  private popstateSubscription: Subscription;

  constructor(private authenticationService: AuthenticationService,
              private domSanitizer : DomSanitizer,
              private router: Router,
              private location: Location,
              @Inject(AUTHENTICATION_ROUTE) private authenticationRoute: string) {
  }

  ngOnInit() {
    /*
     * Fix back bug
     * Issue is that the browser will go back to the previous route. If it's guarded, the route guard will just load the login again
     * Eventually the browser gets to the /authenticate route and going back from there loads the iframe history and Shibboleth displays
     * an error relating to navigating back.
     */
    history.pushState(null, null, this.location.prepareExternalUrl(this.authenticationRoute));

    this.popstateSubscription = <Subscription> this.location.subscribe((value: PopStateEvent) => {
      //This is going to prevent back from working from the login component
      history.go(1);
    });

    this.beginAuthenticationProcess();
  }

  handleChanges(): void {
    try {
      var contentType = this.iframe.nativeElement.contentDocument.contentType;

      if (contentType === "application/json") {
        this._errorMsg = null;
        var jsonText = this.iframe.nativeElement.contentDocument.body.innerText;

        try {
          var json = JSON.parse(jsonText);
          this.authenticationService.storeToken(json.auth_token);
          var authenticated = this.authenticationService.proceedIfAuthenticated();

          if (! authenticated) {
            this.resetSubscription.unsubscribe();
            this.beginAuthenticationProcess();
          }
        } catch (e) {
          //A bit of a workaround for a WildFly issue. Success on Pac4j authentication, but failure on DB load of user put things in a weird state. Just logout, and redo the login.
          this.clearLoginAndRetry();
        }
      }
      else {
        if (this.iframe.nativeElement.contentDocument.title.toUpperCase() === "ERROR") {
          if (this.iframe.nativeElement.contentDocument.body.innerHTML.toUpperCase() === "FORBIDDEN") {
            this._errorMsg = "You do not have permission to log into this application";
          }
          else {
            this._errorMsg = null;
          }

          //A bit of a workaround for a WildFly issue. Success on Pac4j authentication, but failure on DB load of user put things in a weird state. Just logout, and redo the login.
          this.clearLoginAndRetry();
        }
      }
    } catch (e) {
    }
  }

  ngOnDestroy() {
    this.resetSubscription.unsubscribe();
    this.popstateSubscription.unsubscribe();
  }

  private clearLoginAndRetry(): void {
    this.resetSubscription.unsubscribe();
    this.authenticationService.clearLogin().subscribe(
      () => { this.beginAuthenticationProcess(); },
      (error) => { this.beginAuthenticationProcess(); }
    );
  }

  private beginAuthenticationProcess(): void {
    var tokenEndpoint = this.authenticationService.tokenLocation();

    if (tokenEndpoint !== "") {
      this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(tokenEndpoint);
    }

    /**
     * If the user doesn't complete authentication before the IdP session times out, that will be a problem when they eventually
     * attampt to log in. It is likely that users will do this often when they log out or are timed out in the evening, leave
     * their browser open, then attempt to log back in in the morning. In order to work around this, this component will re-request
     * the token prior to IdP timeout, which will reset the  process. This will happen 1 minute before idpInactivityMinutes
     **/
    this.resetSubscription = Observable.interval((this.authenticationService.idpInactivityMinutes - 1) * 60 * 1000)
      .first()
      .subscribe((value) => {
        this.beginAuthenticationProcess();
      });
  }
}

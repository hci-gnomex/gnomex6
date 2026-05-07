import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {AuthenticationService} from './authentication.service';
import {AbstractControl, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {GnomexService} from '../services/gnomex.service';
import {DictionaryService} from '../services/dictionary.service';
import * as Duo from '../services/Duo-Web-v2';
import {DialogsService, DialogType} from '../util/popup/dialogs.service';

@Component({
  selector: 'hci-login-form',
  template: `

    <div class="full-height full-width background">
      <div class="full-height full-width flex-container-col">
        <div class="full-width flex-grow">
        </div>
        <div class="full-width flex-grow">
        </div>
        <div class="full-width flex-container-row align-center">
          <div class="flex-grow flex-container-row">
          </div>
          <div class="container foreground">
            <div class="horizontal-centered login-heading">
              <img [src]="this.gnomexService.logoOrMaint" alt="GNomEx">
            </div>
            <div *ngIf="!this.doDuo" class="full-width major-vertical-spacer flex-container-row align-center">
              <div *ngIf="_errorMsg" class="horizontal-centered small-font full-width {{ errorClasses }}">
                <div class="full-width">
                  <div class="error">Authentication Failed{{ numberOfAttempts > 1 ? ' (' + numberOfAttempts + ')' : '' }}</div>
                  <div class="alert-text full-width">{{_errorMsg}}</div>
                </div>
              </div>
            </div>
            <div class="full-width">
              <form class="login-form" [formGroup]="_loginForm">
                <div class="full-width">
                  <div>
                    <custom-input [form]="_loginForm"
                                  [formControlNameToUse]="'username'"
                                  [type]="'text'"
                                  [placeholder]="' '"
                                  [roundTop]="true"
                                  [roundBottom]="false"
                                  [label]="'Username'"
                                  [tooltip]="'Username tooltip'">
                    </custom-input>
                  </div>
                  <div>
                    <custom-input [form]="_loginForm"
                                  [formControlNameToUse]="'password'"
                                  [label]="'Password'"
                                  [type]="'password'"
                                  [placeholder]="' '"
                                  [roundTop]="false"
                                  [roundBottom]="true"
                                  [noTopBorder]="true"
                                  [tooltip]="'Password tooltip'"></custom-input>
                  </div>
                </div>
                <div class="full-width vertical-spacer">
                </div>
                <button  class="full-width bold primary-button padded"
                         (click)="this.login()">Login
                </button>
                <div   class="full-width vertical-spacer">
                </div>
                <div *ngIf="!this.gnomexService.noGuestAccess && !this.doDuo" class="full-width flex-container-row">
                  <button class="flex-grow secondary-button padded" (click)="this.onResetPassword()">
                    Reset Password
                  </button>
                  <div *ngIf="!this.gnomexService.disableUserSignup && !this.doDuo" class="full-height horizontal-spacer">
                  </div>
                  <button *ngIf="!this.gnomexService.disableUserSignup && !this.doDuo" class="flex-grow secondary-button padded" (click)="this.onNewAccount()">
                    New Account
                  </button>
                </div>
                <div *ngIf="!this.gnomexService.noGuestAccess && !this.doDuo" class="full-width vertical-spacer">
                </div>
                <div *ngIf="!this.gnomexService.noGuestAccess && !this.doDuo" class="full-width flex-container-row">
                  <button class="full-width bold secondary-button padded" (click)="this.guestLogin()">
                    Guest Login
                  </button>
                </div>
              </form>

              <div *ngIf="this.doDuo" class="full-width flex-grow">
                <iframe id="duo_iframe" name="duo_iframe" height="384px"
                >
                </iframe>"
              </div>

            </div>
          </div>
          <div class="flex-grow">
          </div>
        </div>
        <div class="full-width flex-grow major-padded-top flex-container-row">
        </div>
        <div class="full-width flex-grow">
        </div>
        <div class="full-width flex-grow">
        </div>
      </div>
    </div>

  `,
  styleUrls: ['./directlogin.component.scss']
})
export class DirectLoginComponent implements OnInit {
  public _loginForm: FormGroup;
  public _errorMsg: string;

  public numberOfAttempts = 0;

  public errorClasses = '';

  public sig_request = 'not sig_request';
  public duo_sig = 'not duo_sig';
  public duo_src = 'not duo_src';
  public authenticated_username = '';
  public doDuo = false;

  constructor(private _authenticationService: AuthenticationService,
              private _formBuilder: FormBuilder,
              public gnomexService: GnomexService,
              private changeDetectorRef: ChangeDetectorRef,
              private dialogsService: DialogsService,
              private router: Router) {
  }

  ngOnInit(): void {
    this._loginForm = this._formBuilder.group({
      invalidateWithoutUsernameAndPasswordComponents: new FormControl('', (control: AbstractControl) => {
        if (control
          && control.parent
          && control.parent.controls
          && (control.parent as any).controls.username
          && (control.parent as any).controls.password) {
          return null;
        } else {
          return { message: 'Grid is not populated yet' };
        }
      }),
    });

    this.gnomexService.getLoginProperties();
  }

  login() {
    this.numberOfAttempts++;
    this._errorMsg = null;

    let okToLogin = true;
    console.log('username: ' + this._loginForm.value.username);

    if (this.gnomexService.maintenanceMode && !(this._loginForm.value.username === 'adminBatch' ) ) {
      this._errorMsg = 'GNomEx is undergoing maintenance.  Please try again later.';
      okToLogin = false;
    }
    if (okToLogin) {
      this._authenticationService.login(this._loginForm.value.username, this._loginForm.value.password).subscribe((res) => {
        if (res) {
          this._errorMsg = null;

          if (('' + this._loginForm.value.username).match(/^[uU]\d{7,8}$/) ) {
            this._authenticationService.findAppUserByUsername(this._loginForm.value.username).subscribe((result: any) => {
              if (result && result.hasUserAccount && ('' + result.hasUserAccount).toLowerCase() === 'y') {
                if (result.isActive && ('' + result.isActive).toLowerCase() === 'y') {
                  if (this.gnomexService.duoExceptions && this.gnomexService.duoExceptions.includes(this._loginForm.value.username) ) {
                    this.gnomexService.useduo = false;
                  }
                  if (this.gnomexService.useduo) {
                    this._authenticationService.getDuoInit(this._loginForm.value.username)
                      .subscribe((init: any) => {
                        this.doDuo = true;
                        this.changeDetectorRef.detectChanges();

                        Duo.init({
                          iframe: 'duo_iframe',
                                            host: init.duohost,          // from /api/duo/sign response
                                            sig_request: init.sig_request, // from /api/duo/sign response
                          submit_callback: this.twoFactorVerify.bind(this),
                        });

                      }, () => {
                        this.doDuo = false;
                        this._errorMsg = 'Unable to start Duo. Please try again or contact support.';
                      });
                  } else {
                    this._authenticationService.requestAccessToken(true);
                  }
                } else {
                  this._errorMsg = 'UID recognized, but account has been inactivated. Please continue with "Guest Login" and contact your lab\'s Core Administrator or GNomEx Support';
                }
              } else {
                this._errorMsg = 'That UID, while valid, does not belong to any labs. Please create an account or click "Guest Login"';
              }
            });
          } else {
            this._authenticationService.findAppUserByUsername(this._loginForm.value.username).subscribe((result: any) => {
              if (result && result.hasUserAccount && ('' + result.hasUserAccount).toLowerCase() === 'y') {
                if (result.isActive && ('' + result.isActive).toLowerCase() === 'y') {
                  this._authenticationService.requestAccessToken(true);
                } else {
                  this._errorMsg = 'Your account has been inactivated. Please continue with "Guest Login" and contact your lab\'s Core Administrator or GNomEx Support';
                }
              } else {
                this._errorMsg = 'Please check your credentials, create a new account or click "Guest Login"';
              }
            });
          }
        } else {
          this._errorMsg = 'Please check your credentials (2).';
        }
      }, (error: any) => {
        this._errorMsg = 'Please check your credentials (3).';
      });
    }
  }

  guestLogin(): void {
    this._authenticationService.guestLogin();
    this.router.navigateByUrl('home');
  }

  public onNewAccount(): void {
    this.router.navigateByUrl('register-user');
  }

  twoFactorVerify(response: any) {
    let sigResponse = null;
    if (response && response.elements && response.elements.sig_response) {
      sigResponse = response.elements.sig_response.value;
    }

    this._authenticationService.verifyDuo(sigResponse).subscribe((res: any) => {
      if (res && res.ok) {
        this._authenticationService.requestAccessToken(true);
      } else {
        this.dialogsService.alert('Invalid passcode - please notify gnomex support', null, DialogType.WARNING);
      }
    }, () => {
      this.dialogsService.alert('Invalid passcode - please notify gnomex support', null, DialogType.WARNING);
    });
  }

  public onResetPassword(): void {
    this.router.navigateByUrl('reset-password');
  }
}

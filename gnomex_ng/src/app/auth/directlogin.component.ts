import {Component, OnInit} from "@angular/core";
import {AuthenticationService} from "./authentication.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";

@Component({
    selector: "hci-login-form",
    template: `
        
        <div class="full-height full-width">    
            <div class="full-height full-width flex-container-col">
                <div class="full-width flex-grow">
                </div>
                <div class="full-width flex-container-row align-center">
                    <div class="flex-grow flex-container-row major-padded-right">
                        <div class="flex-grow">
                        </div>
                        <div class="">
                            <button class="full-width massive-padding login-box" (click)="this.guestLogin()">
                                Guest Login
                            </button>
                        </div>
                    </div>
                    <div class="container">
                        <div class="login-box major-padding login-background">
                            <div class="horizontal-centered login-heading">
                                <h3>Sign in</h3>
                            </div>
                            <div class="full-width">
                                <form [formGroup]="_loginForm">
                                    <div class="full-width flex-container-row">
                                        <div style="width: 75%">
                                            <div class="flex-container-row align-center">
                                                <div class="padded-right right-align" style="width: 33%">
                                                    Username
                                                </div>
                                                <div class="full-height flex-grow">
                                                    <input formControlName="username"
                                                           name="username"
                                                           class="full-width form-control"
                                                           type="text"
                                                           autofocus>
                                                </div>
                                            </div>
                                            <div class="flex-container-row align-center">
                                                <div class="padded-right right-align" style="width: 33%">
                                                    Password
                                                </div>
                                                <div class="full-height flex-grow">
                                                    <input formControlName="password"
                                                           name="password"
                                                           class="full-width form-control"
                                                           type="password">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex-container-row align-center flex-grow padded">
                                            <button class="full-width rounded-button right-rounded" (click)="this.login()"
                                                    [disabled]="!_loginForm.valid">Login
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="flex-grow flex-container-row major-padded-left">
                        <div class="">
                            <button class="full-width less-massive-padding login-box" (click)="this.onNewAccount()">
                                New Account
                            </button>
                            <div class="full-width vertical-spacer">
                            </div>
                            <button class="full-width less-massive-padding login-box" (click)="this.onResetPassword()">
                                Reset Password
                            </button>
                        </div>
                        <div class="flex-grow">
                        </div>
                    </div>
                </div>
                <div class="full-width flex-grow major-padded-top flex-container-row">
                    <div class="full-height flex-grow">
                    </div>
                    <div *ngIf="_errorMsg" class="login-box major-padding minimize login-background horizontal-centered">
                        <div class="alert-box">
                            <h5 class="error">Authentication Failed</h5>
                            <span class="alert-text">{{_errorMsg}}</span>
                        </div>
                    </div>
                    <div class="full-height flex-grow">
                    </div>            
                </div>
                <div class="full-width flex-grow">
                </div>
                <div class="full-width flex-grow">
                </div>
            </div>
        </div>
        
    `,
    styles: [`
        
        
        button { background-color: #dcdcc9; }
        
        .container {
            width: 30em;
            max-width: 35em;
        }
        
        .blue-button {
            background-color: blue;
            color: white;
        }
        
        .minimize { height: fit-content; }
        
        
        .error { color: red; }


        .major-padded-top   { padding-top:   1.5em; }
        .major-padded-left  { padding-left:  1.5em; }
        .major-padded-right { padding-right: 1.5em; }
        
        .less-massive-padding { padding: 0.95em; }
        .massive-padding      { padding: 2.5em; }
        
        .horizontal-centered { text-align: center; }

        .right-align { text-align: right; }
        
        .vertical-spacer { height: 0.1em; }

        .rounded-button {
            height: 4em;
        }
        
        .rounded-button:focus { outline: 0;}
        
        .left-rounded {
            border-top-left-radius: 2em;
            border-bottom-left-radius: 2em;
        }
        .right-rounded {
            
            border-top-right-radius: 2em;
            border-bottom-right-radius: 2em;
        }

        
        
        .major-padding { padding: 15px; }
        
        .login-box {
            border-radius: 10px;
            box-shadow: 0 0 2px #ccc;
        }

        .login-box .login-heading h3 {
            line-height: 1.5;
            margin: 0 0 10px
        }

        .login-box .form-control {
            padding: 10px;
            border: 1px solid #ccc;
        }

        .login-box input[type="password"] {
            border-top-left-radius: 0;
            border-top-right-radius: 0;
        }

        .login-box input[type="text"] {
            margin-bottom: -1px;
            border-bottom-right-radius: 0;
            border-bottom-left-radius: 0;
        }
        
        /*.login-box .alert-box {*/
            /*margin: 10px 0 -5px 0*/
        /*}*/

        .login-box .alert-text {
            font-size: small;
        }
        
        
    `]
})
export class DirectLoginComponent implements OnInit {
    public _loginForm: FormGroup;
    public _errorMsg: string;

    constructor(private _authenticationService: AuthenticationService,
                private _formBuilder: FormBuilder,
                private router: Router) {
    }

    /**
     * Initializes the authentication form.
     */
    ngOnInit(): void {
        this._loginForm = this._formBuilder.group({
            username: ["", Validators.required],
            password: ["", Validators.required]
        });
    }

    /**
     * A function to submit the login form the the {@link UserService}.
     */
    login() {
        this._authenticationService.login(this._loginForm.value.username, this._loginForm.value.password)
            .subscribe((res) => {
                if (res) {
                    this._errorMsg = null;
                    this._authenticationService.requestAccessToken(true);
                }
            }, (error: any) => {
                this._errorMsg = "Please check your username and password.";
            });
    }

    guestLogin(): void {
        this._authenticationService.guestLogin();
        this.router.navigateByUrl("home");
    }

    public onNewAccount(): void {
        this.router.navigateByUrl("register-user");
    }

    public onResetPassword(): void {
        this.router.navigateByUrl("reset-password");
    }
}

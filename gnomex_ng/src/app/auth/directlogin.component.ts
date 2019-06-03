import {Component, OnInit} from "@angular/core";
import {AuthenticationService} from "./authentication.service";
import {AbstractControl, FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Router} from "@angular/router";
import {GnomexService} from "../services/gnomex.service";

@Component({
    selector: "hci-login-form",
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
                            <img src="../../assets/gnomex_logo_hdr.png" alt="GNomEx">
                        </div>
                        <div class="full-width major-vertical-spacer flex-container-row align-center">
                            <div *ngIf="_errorMsg" class="horizontal-centered small-font {{ errorClasses }}">
                                <div>
                                    <div class="error">Authentication Failed{{ numberOfAttempts > 1 ? ' (' + numberOfAttempts + ')' : '' }}</div>
                                    <div class="alert-text">{{_errorMsg}}</div>
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
                                                      [tooltip]="'Username tooltip'"></custom-input>
                                    </div>
                                </div>
                                <div class="full-width vertical-spacer">
                                </div>
                                <button class="full-width bold primary-button padded"
                                        (click)="this.login()">Login
                                </button>
                                <div class="full-width vertical-spacer">
                                </div>
                                <div class="full-width flex-container-row">
                                    <button class="flex-grow secondary-button padded" (click)="this.onResetPassword()">
                                        Reset Password
                                    </button>
                                    <div *ngIf="!this.gnomexService.disableUserSignup" class="full-height horizontal-spacer">
                                    </div>
                                    <button *ngIf="!this.gnomexService.disableUserSignup" class="flex-grow secondary-button padded" (click)="this.onNewAccount()">
                                        New Account
                                    </button>
                                </div>
                                <div *ngIf="!this.gnomexService.noGuestAccess" class="full-width vertical-spacer">
                                </div>
                                <div *ngIf="!this.gnomexService.noGuestAccess" class="full-width flex-container-row">
                                    <button class="full-width bold secondary-button padded" (click)="this.guestLogin()">
                                        Guest Login
                                    </button>
                                </div>
                            </form>
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
    styles: [`
        
        .small-font { font-size: small; }
        
        .primary-button {
            font-family: "Arial", Helvetica, sans-serif;
            font-size: 14pt;
            
            color: #FFFFFF;
            border-radius: 6px;
            border-color: #70bb70;

            background-image:linear-gradient(60deg,green,green 40%,#1a1 60%,green 90%,green);
            animation: anim 8s linear infinite alternate;
            background-position: -200px 0;
        }
        
        .primary-button:focus {
            outline: none;
        }
        
        .primary-button:active {
            border-color: darkgreen;
            border-radius: 6px;
        }
        
        @keyframes anim{
            0%{
                background-position: -300px 0;
            }
            50%{
                background-position: 0 0;
            }
            100%{
                background-position: 300px 0;
            }
        }
        
        .secondary-button { 
            font-family: "Arial", Helvetica, sans-serif;
            font-size: 12pt;
            
            color: grey;
            background-color: #C6CCBE;
            border-radius: 4px
        }
        
        .container {
            width: 24em;
            max-width: 24em;

            border: solid 1px #CCCCCC;
            padding: 1.25em 2.5em;
        }
        
        .bold { font-weight: bold; }
        
        .background { background-color: #F9FFFC; }
        .foreground { 
            background-color: #E9EFDE;
            border-radius: 10px;
            
            box-shadow: rgba(0,0,0,0.3) 5px 5px 5px;
        }
        
        .minimize { height: fit-content; }
        
        
        .error { color: red; }

        .padded { padding: 0.4em; }
        

        .major-padded-top   { padding-top:   1.5em; }
        .major-padded-left  { padding-left:  1.5em; }
        .major-padded-right { padding-right: 1.5em; }
        
        .horizontal-centered { text-align: center; }

        .right-align { text-align: right; }
        
        .vertical-spacer   { height: 10px; }
        .horizontal-spacer { width:  10px; }

        .major-vertical-spacer { height: 3em; }
        
        
        .major-padding { padding: 15px; }
        

        input.username {
            color: black;
            background-color: #FFFFFF;
            padding: 0.7em;
            border: 1px solid #CCCCCC;

            border-radius: 4px 4px 0 0;
        }

        input.password {
            color: black;
            background-color: #FFFFFF;
            padding: 0.7em;
            border: 1px solid #CCCCCC;
            border-top: 0 solid #CCCCCC;

            border-radius: 0 0 4px 4px;
        }


        .login-form {
            transition: all .3s;
        }

        input[type="text"]:focus, input[type="password"]:focus {
            background-color: white;
            
            transition: all .3s;
        }
        
        input[type="text"]:focus+label {
            font-size: 8pt;
            top: -3.5em;
            left: 0.5em;
            z-index: 5;
            position: relative;
            
            background-color: white;
            
            /*top: 5px;*/
            /*left: 10px;*/
            /*bottom: auto;*/
            /*padding-left: 0;*/
            /*padding-bottom: 2px;*/
            /*font-size: 12px;*/
            /*border-bottom: 1px solid rgba(0, 0, 0, .1);*/
            /*color: #999;*/
            
            transition: all .3s;
        }
        
        input[type="password"]:focus+label {
            background-color: white;
            
            top: 5px;
            left: 10px;
            bottom: auto;
            padding-left: 0;
            padding-bottom: 2px;
            font-size: 12px;
            border-bottom: 1px solid rgba(0, 0, 0, .1);
            color: #999;

            transition: all .3s;
        }

        input[type="text"]:not:placeholder-shown+label {
            font-size: 8pt;
            top: -3.5em;
            left: 0.5em;
            z-index: 5;
            position: relative;
            
            /*top: 5px;*/
            /*left: 10px;*/
            /*bottom: auto;*/
            /*padding-left: 0;*/
            /*padding-bottom: 2px;*/
            /*font-size: 12px;*/
            /*border-bottom: 1px solid rgba(0, 0, 0, .1);*/
            /*color: #999;*/
            
            transition: all .3s;
        }
        
        input:valid {
            z-index:999;
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAACJklEQVRIia3WX2jOURzH8dfz2xK25m+7WEvSrpbkSsTFc7EhDSk3YyUlTSjcLGk5l0qSJEq5crFkCCminqRcrZa0NMuFJK2l9VxILLk4v4fHs+ffnnzqV79zzvf7/v5+53zP95yMSgpgHXZhB9ZjJeaQxzs8xRNMpvbzlKkA7sQw9qfQasrjIc7jQ2mgpIzDHrzG0Trg0IaB1OdAaYCmf1rBIG5hRR3gUrVgL37KeiUXOzMpGPowikUNwIs1h8O4Lfydog5c+w9waMYldFGYoqwL6GkA9gv3U86qov4WtMsazQjWYAyrGwjwAP1oxSNsLhrLY0uC7Q3CZ3BS8D2FLS4Zb0NfIm6iheoHjgs+CRKcw8Yydr0JuhsIcAf30vdNOFPBrjvB8gXCP2JIMCdoxRVxDcqpLREzoZy+oBfHxNyW2h4TfE7bw+IfVFSzuEDldBHP04eY2yNicSPYjFPV4MgneFth8BA6011+AwdxVkDQpr6NOZERHMHNCgZvsFvw8U9PDHi5jq+HoQTPxJwupw14JOgs6usRK20t5fG4UOyu4kQV43Hsw1dx13fVEWAE/YUAHWI9X1PFYRbfxMJYS9PYKpgqVNPPYjr+qOK0vE74HE5jikI1zSHnvaxpsXQ0VXCuBz6M64WT7V9QzpiscWzDsgXCpzFYDJ8fALImcRdLxVvFkhrg2dR+AC9Lz+T5t4qCouFa7BSnrRvt4ik4gwm8UOPa8htG8HgowA/lzwAAAABJRU5ErkJggg==');
            background-repeat:no-repeat;
            background-position:3px 16px;
            background-size:16px 16px;

            transition: all .3s;
        }
        
        input:valid+label {
            color: green;
            border-bottom: solid green 1px;

            transition: all .3s;
        }

        input:invalid:not:focus~label {  
            color: #800;
            border-bottom: solid #800 1px;

            transition: all .3s;
        }
        
        input:invalid:focus ~ .tooltip {
            display: block;

            transition: all .3s;
        }
        
        input:placeholder-shown ~ .tooltip {
            display: none;

            transition: all .3s;
        }

        input~label {
            top: -2.5em;
            left: 1.0em;
            z-index: 5;
            position: relative;

            background-color: white;
            
            transition: all .3s;
        }

        input:focus~label {
            font-size: 8pt;
            top: -3.5em;
            left: 0.5em;
            z-index: 5;
            position: relative;

            transition: all .3s;
        }
        
        input:placeholder-shown~label {
            top: -2.5em;
            left: 1.0em;
            z-index: 5;
            position: relative;

            transition: all .3s;
        }

        .tooltip {
            z-index: 100;
            display: none;
            position: absolute;
            left: 20px;
            top: 60px;
            right: 20px;
            padding: 10px;
            font-size: 14px;
            background-color: black;
            color: white;
            box-shadow: 1px 1px 3px 1px black;
            transition: all .3s;
        }
        .tooltip:after { 
            content: ""; 
            display: block; 
            position: absolute; 
            bottom: 100%; 
            left:10px; 
            border-bottom: 10px solid black; 
            border-top: 0px solid transparent; 
            border-right: 10px solid transparent; 
            border-left: 10px solid transparent;
            transition: all .3s;
        }
        .tooltip > label {
            position: absolute;
            color: #888;
            font-size: 20px;
            padding: 0 20px;
            background-color: white;
            left: 6px;
            top: 20px;
            bottom: 1px;
            right: 6px;
            cursor:text;
            transition: all .3s;
        }
        
    `]
})
export class DirectLoginComponent implements OnInit {
    public _loginForm: FormGroup;
    public _errorMsg: string;

    public numberOfAttempts: number = 0;

    public errorClasses: string = '';

    constructor(private _authenticationService: AuthenticationService,
                private _formBuilder: FormBuilder,
                public gnomexService: GnomexService,
                private router: Router) {
    }

    /**
     * Initializes the authentication form.
     */
    ngOnInit(): void {
        this._loginForm = this._formBuilder.group({
            invalidateWithoutUsernameAndPasswordComponents: new FormControl('', (control: AbstractControl) => {
                if (control
                    && control.parent
                    && control.parent.controls
                    && control.parent.controls['username']
                    && control.parent.controls['password']) {
                    return null;
                } else {
                    return { message: 'Grid is not populated yet' };
                }
            }),
            // username: ["", Validators.required],
            // password: ["", Validators.required]
        });

        this.gnomexService.getLoginProperties();

        // This is needed due to a bug with angular adding items in components to surrounding forms.
        // this._loginForm.addControl(
        //
        // );
    }

    /**
     * A function to submit the login form the the {@link UserService}.
     */
    login() {
        this.numberOfAttempts++;

        this._authenticationService.login(this._loginForm.value.username, this._loginForm.value.password)
            .subscribe((res) => {
                if (res) {
                    this._errorMsg = null;
                    this._authenticationService.requestAccessToken(true);
                }
            }, (error: any) => {
                this._errorMsg = "Please check your credentials.";
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

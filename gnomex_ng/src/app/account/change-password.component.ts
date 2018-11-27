import {Component, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {PasswordUtilService} from "../services/password-util.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";

@Component({
    selector: "change-password",
    template: `
        <div class="flex-container-col padded align-center container">
            <div class="flex-container-row justify-space-between full-width header">
                <img src="../../assets/gnomex_logo.png">
                <div class="spaced-children">
                    <a [routerLink]="['/authenticate']">Sign in</a>
                    <span>|</span>
                    <a [routerLink]="['/reset-password']">Reset password</a>
                    <span>|</span>
                    <a [routerLink]="['/register-user']">Sign up for an account</a>
                </div>
            </div>
            <div class="flex-container-col align-center flex-grow">
                <div class="flex-container-col align-center flex-grow border-subtle login-background main-form">
                    <h5>Change Password</h5>
                    <mat-form-field class="input-field">
                        <input matInput [formControl]="this.formGroup.controls['username']" placeholder="Username">
                    </mat-form-field>
                    <mat-form-field class="input-field">
                        <input matInput type="password" [formControl]="this.formGroup.controls['password']" placeholder="New Password">
                    </mat-form-field>
                    <mat-form-field class="input-field">
                        <input matInput type="password" [formControl]="this.formGroup.controls['passwordConfirm']" placeholder="New Password (confirm)">
                    </mat-form-field>
                    <div class="flex-container-row justify-space-between align-center full-width">
                        <div class="text-align-center flex-grow">
                            {{this.passwordUtilService.PASSWORD_COMPLEXITY_REQUIREMENTS}}
                        </div>
                        <div class="flex-grow flex-container-row justify-center">
                            <button mat-raised-button [disabled]="this.formGroup.invalid" (click)="this.submit()">Submit</button>
                        </div>
                    </div>
                    <div class="text-body">
                        If you have registered using your uNID (u0000000), your password is tied to the University Campus Information System. Please use the <a href='https://gate.acs.utah.edu/' target='_blank'>Campus Information System</a> to change or reset your password.
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .spaced-children > *:not(:last-child) {
            margin-right: 1em;
        }
        div.container {
            width: 900px;
            min-width: 900px;
        }
        div.header {
            margin-bottom: 25px;
        }
        div.main-form {
            width: 500px;
            padding: 10px;
        }
        div.text-body {
            padding-top: 10px;
            text-align: center;
        }
        mat-form-field.input-field {
            width: 250px;
        }
        .text-align-center {
            text-align: center;
        }
        .justify-center {
            justify-content: center;
        }
  `]
})
export class ChangePasswordComponent implements OnInit {

    private guid: string;
    public formGroup: FormGroup;

    constructor(private passwordUtilService: PasswordUtilService,
                private dialogsService: DialogsService,
                private router: Router,
                private route: ActivatedRoute,
                private fb: FormBuilder) {
    }

    ngOnInit(): void {
        this.formGroup = this.fb.group({
            username: ['', Validators.required],
            password: ['', [Validators.required, PasswordUtilService.validatePassword]],
            passwordConfirm: ['', [Validators.required, PasswordUtilService.validatePasswordConfirm]],
        });

        this.route.paramMap.subscribe((params: ParamMap) => {
            this.guid = params.get("guid");
        })
    }

    public submit(): void {
        let username: string = this.formGroup.controls['username'].value;
        let password: string = this.formGroup.controls['password'].value;
        let passwordConfirm: string = this.formGroup.controls['passwordConfirm'].value;
        this.passwordUtilService.changePassword(username, password, passwordConfirm, this.guid).subscribe((result: any) => {
            if (result && result.result && result.result === 'SUCCESS') {
                this.dialogsService.confirm("Your password has been changed", null);
                this.router.navigateByUrl("/authenticate");
            } else {
                let message: string = "";
                if (result && result.message) {
                    message = ": " + result.message;
                }
                this.dialogsService.confirm("An error occurred while changing your password" + message, null);
            }
        });
    }

}

import {Component, OnInit} from "@angular/core";
import {FormControl, Validators} from "@angular/forms";
import {PasswordUtilService} from "../services/password-util.service";
import {DialogsService, DialogType} from "../util/popup/dialogs.service";
import {Router} from "@angular/router";
import {GnomexService} from "../services/gnomex.service";

@Component({
    selector: "reset-password",
    template: `
        <div class="flex-container-col padded align-center container">
            <div class="flex-container-row justify-space-between full-width header">
                <img src="../../assets/gnomex_logo.png">
                <div class="spaced-children">
                    <a [routerLink]="['/authenticate']">Sign in</a>
                    <span *ngIf="!this.gnomexService.disableUserSignup">|</span>
                    <a *ngIf="!this.gnomexService.disableUserSignup" [routerLink]="['/register-user']">Sign up for an account</a>
                </div>
            </div>
            <div class="flex-container-col align-center flex-grow">
                <div class="flex-container-col align-center flex-grow border-subtle login-background main-form">
                    <h5>Reset Password</h5>
                    <mat-form-field class="input-field">
                        <input matInput [formControl]="this.inputFC" placeholder="{{this.checkByUsername ? 'Username' : 'Email'}}">
                    </mat-form-field>
                    <div class="flex-container-row justify-space-between align-center full-width">
                        <mat-slide-toggle color="primary" [(ngModel)]="this.checkByUsername">{{!this.checkByUsername ? 'Lookup by username' : 'Lookup by email'}}</mat-slide-toggle>
                        <button mat-raised-button [disabled]="this.inputFC.invalid" (click)="this.submit()">Submit</button>
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
  `]
})
export class ResetPasswordComponent implements OnInit {

    public checkByUsername: boolean = true;
    public inputFC: FormControl;

    constructor(private passwordUtilService: PasswordUtilService,
                private dialogsService: DialogsService,
                public gnomexService: GnomexService,
                private router: Router) {
    }

    ngOnInit(): void {
        this.inputFC = new FormControl("", Validators.required);

        this.gnomexService.getLoginProperties();
    }

    public submit(): void {
        this.passwordUtilService.resetPassword(this.checkByUsername, this.inputFC.value).subscribe((result: any) => {
            if (result && result.result && result.result === 'SUCCESS') {
                this.dialogsService.alert("Instructions on how to change your password have been emailed to you", "", DialogType.SUCCESS);
                this.router.navigateByUrl("/authenticate");
            } else {
                let message: string = "";
                if (result && result.message) {
                    message = ": " + result.message;
                }
                this.dialogsService.error("An error occurred while resetting your password" + message);
            }
        });
    }

}

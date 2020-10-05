import {Component, OnInit} from "@angular/core";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {AuthenticationService} from "./authentication.service";
import {AbstractControl, FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Router} from "@angular/router";
import {GnomexService} from "../services/gnomex.service";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";
import {PasswordUtilService} from "../services/password-util.service";
import {DialogsService, DialogType} from "../util/popup/dialogs.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

@Component({
    selector: 'changeyourpassword',
    templateUrl: "./changeyour-password.component.html",
    styles: [`
        div.flex-container-row {
            display: flex;
            flex-direction: row;
        }
        .justify-center {
            justify-content: center;
        }
        .justify-space-evenly {
            justify-content: space-evenly;
        }
        
        .primary-button {
            font-family: "Arial", Helvetica, sans-serif;
            font-size: 14pt;
            
            color: #FFFFFF;
            border-radius: 6px;
            border-color: #70bb70;

            background-image:linear-gradient(60deg,blue,blue 40%,#1a1 60%,blue 90%,blue);
            animation: anim 8s linear infinite alternate;
            background-position: -200px 0;
        }
        
        .primary-button:focus {
            outline: none;
        }
        
        .primary-button:active {
            border-color: darkblue;
            border-radius: 6px;
        }
                
    `]
})

    export class ChangeyourPasswordComponent implements OnInit {
    public _changeyourpasswordForm: FormGroup;
    public _errorMsg: string;

    public errorClasses: string = '';

    constructor(private dialogRef: MatDialogRef<ChangeyourPasswordComponent>,
                private _authenticationService: AuthenticationService,
                private _formBuilder: FormBuilder,
                public gnomexService: GnomexService,
                public passwordUtilService: PasswordUtilService,
                private dialogsService: DialogsService,
                private router: Router) {
 //       super();
    }

    /**
     * Initializes the change password form.
     */
    ngOnInit(): void {
        this._changeyourpasswordForm = this._formBuilder.group({
            invalidateWithoutUsernameAndPasswordComponents: new FormControl('', (control: AbstractControl) => {
                if (control
                    && control.parent
                    && control.parent.controls
                    && control.parent.controls['new password']
                    && control.parent.controls['confirm password']) {
                    return null;
                } else {
                    return { message: 'Change password - Grid is not populated yet' };
                }
            }),

         });


    }

    onSave(): void {

    }


    public save(): void {
        let username: string = this.gnomexService.theUsername;
        let password: string =  this._changeyourpasswordForm.value.password;
        let passwordConfirm: string = this._changeyourpasswordForm.value.passwordConfirm;
        console.log('Username: ' ,username);
        console.log('Password: ' ,password);
        console.log('PasswordConfirm: ' ,passwordConfirm);

        this.passwordUtilService.forceChangePassword(username, password, passwordConfirm).subscribe((result: any) => {
            if (result && result.result && result.result === "SUCCESS") {
                this.dialogsService.alert("Your password has been changed", "", DialogType.SUCCESS);
                this.dialogRef.close();
                this.router.navigateByUrl("/home");
            } else {
                let message: string = "";
                if (result && result.message) {
                    message = ": " + result.message;
                }
                this.dialogsService.error("An error occurred while changing your password" + message);
            }
        }, (err: IGnomexErrorResponse) => {
        });
    }



}

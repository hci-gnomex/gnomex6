import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {IRegisterUser, ISimpleLab} from "../../util/interfaces/register-user.model";
import {DialogsService, DialogType} from "../../util/popup/dialogs.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatSlideToggleChange} from "@angular/material";
import {PasswordUtilService} from "../../services/password-util.service";
import {UserService} from "../../services/user.service";
import {HttpParams} from "@angular/common/http";
import {invalidExternalUsrName} from "../../util/validators/invalid-external-username.validator";
import {HttpUriEncodingCodec} from "../../services/interceptors/http-uri-encoding-codec";

@Component({

    template: `
        <div class="flex-container-col padded align-center container">
            <div class="flex-container-row justify-space-between full-width header">
                <img [src]="siteLogo" >
                <div class="spaced-children">
                    <a [routerLink]="['/authenticate']" >Sign in</a>
                    <span> | </span>
                    <a [routerLink]="['/reset-password']" >Reset password  </a>
                </div>
            </div>
            <div class="flex-container-col align-center flex-grow">
                <form (ngSubmit)="submit(formGroup)" [formGroup]="formGroup" class="flex-container-col align-center flex-grow border-subtle login-background main-form"   >
                    <h2 mat-dialog-title style="text-align: center"> Sign up for an account </h2>
                    <div class="flex-container-col align-center">
                        <mat-form-field  class="input-field">
                            <input matInput placeholder="First Name" formControlName="firstName">
                            <mat-error *ngIf="this.formGroup?.controls['firstName']?.hasError('required')">
                                This field is required
                            </mat-error>
                        </mat-form-field>
                        <mat-form-field  class="input-field">
                            <input matInput placeholder="Last Name" formControlName="lastName">
                            <mat-error *ngIf="this.formGroup?.controls['lastName']?.hasError('required')">
                                This field is required
                            </mat-error>
                        </mat-form-field>
                        <mat-form-field  class="input-field">
                            <input matInput placeholder="Email" formControlName="email">
                            <mat-error *ngIf="this.formGroup?.controls['email']?.hasError('required')">
                                This field is required
                            </mat-error>
                            <mat-error *ngIf="this.formGroup?.controls['email']?.hasError('pattern')">
                                The email format is invalid
                            </mat-error>

                        </mat-form-field>
                        <mat-form-field  class="input-field">
                            <input matInput placeholder="Phone" formControlName="phone">
                            <mat-error *ngIf="this.formGroup?.controls['phone']?.hasError('required')">
                                This field is required
                            </mat-error>

                        </mat-form-field>
                        <div>
                            <mat-slide-toggle (change)="toggledLabState($event)" formControlName="labToggler" [color]="color">
                                New Lab
                            </mat-slide-toggle>
                        </div>
                    </div>
                    <div>
                        <div class="flex-container-col" formGroupName="newLabGroup" *ngIf="formGroup.get('labToggler').value; else selectLab">
                            <div class="flex-container-row spaced-children-margin">
                                <mat-form-field class="input-field">
                                    <input matInput placeholder="Lab First Name" formControlName="newLabFirstName">
                                    <mat-error *ngIf="this.formGroup?.get('newLabGroup.newLabFirstName')?.hasError('required')">
                                        This field is required
                                    </mat-error>
                                </mat-form-field>
                                <mat-form-field class="input-field">
                                    <input matInput placeholder="Lab Last Name" formControlName="newLabLastName">
                                    <mat-error *ngIf="this.formGroup?.get('newLabGroup.newLabLastName')?.hasError('required')">
                                        This field is required
                                    </mat-error>
                                </mat-form-field>
                            </div>
                            <div class="flex-container-row spaced-children-margin">
                                <mat-form-field class="input-field">
                                    <input matInput placeholder="Department" formControlName="department">
                                </mat-form-field>
                                <mat-form-field  class="input-field">
                                    <input matInput placeholder="PI Email" formControlName="contactEmail">
                                    <mat-error *ngIf="this.formGroup?.get('newLabGroup.contactEmail')?.hasError('required')">
                                        This field is required
                                    </mat-error>
                                    <mat-error *ngIf="this.formGroup?.get('newLabGroup.contactEmail')?.hasError('pattern')">
                                        The email format is invalid
                                    </mat-error>
                                </mat-form-field>
                            </div>
                            <div class="flex-container-row">
                                <mat-form-field class="input-field">
                                    <input matInput placeholder="Pi Phone" formControlName="contactPhone">
                                    <mat-error *ngIf="this.formGroup?.get('newLabGroup.contactPhone')?.hasError('pattern')">
                                        This field is required
                                    </mat-error>
                                </mat-form-field>
                            </div>

                        </div>
                        <ng-template #selectLab >

                            <div class="input-field">
                                <custom-combo-box placeholder="Choose Lab"
                                                  displayField="name" [options]="labs" valueField="idLab"
                                                  [formControlName]="'labDropdown'">
                                </custom-combo-box>
                            </div>
                        </ng-template>
                    </div>
                    <div>
                        <mat-slide-toggle
                                *ngIf="isUniversityAuthd"
                                (change)="toggledUniversityState($event)"
                                formControlName="uofuAffiliate"
                                [color]="color">
                            Affiliated with the University of Utah
                        </mat-slide-toggle>
                    </div>
                    <div>
                        <div class="flex-container-row"  *ngIf="formGroup.get('uofuAffiliate').value; else externalU">
                            <mat-form-field  class="input-field">
                                <input matInput placeholder="uNID" formControlName="uNID">
                                <mat-error *ngIf="this.formGroup?.get('uNID')?.hasError('required')">
                                    This field is required
                                </mat-error>
                                <mat-error *ngIf="this.formGroup?.get('uNID')?.hasError('pattern')">
                                    Format should be a "u" followed by 7 digits (u0000000)
                                </mat-error>

                            </mat-form-field>

                        </div>
                        <ng-template #externalU >
                            <div formGroupName="externalToUniversityGroup" class="flex-container-col align-center">
                                <div class="flex-container-row spaced-children-margin">
                                    <mat-form-field class="input-field">
                                        <input matInput placeholder="Institute" formControlName="institute">
                                    </mat-form-field>
                                    <mat-form-field class="input-field">
                                        <input matInput placeholder="User Name" formControlName="userNameExternal">
                                        <mat-error *ngIf="this.formGroup?.get('externalToUniversityGroup.userNameExternal')?.hasError('required')">
                                            This field is required
                                        </mat-error>
                                        <mat-error *ngIf="this.formGroup?.get('externalToUniversityGroup.userNameExternal')?.hasError('invalidExternalUsrName')">
                                            {{this.formGroup?.get('externalToUniversityGroup.userNameExternal')?.errors["invalidExternalUsrName"]}}
                                        </mat-error>
                                    </mat-form-field>
                                </div>
                                <div class="flex-container-row spaced-children-margin" >
                                    <mat-form-field class="input-field">
                                        <input type="password" matInput placeholder="Password" formControlName="passwordExternal">
                                        <mat-error *ngIf="this.formGroup?.get('externalToUniversityGroup.passwordExternal')?.hasError('required')">
                                            This field is required
                                        </mat-error>
                                        <mat-error *ngIf="this.formGroup?.get('externalToUniversityGroup.passwordExternal')?.hasError('validatePassword')">
                                            Invalid password pattern
                                        </mat-error>
                                    </mat-form-field>
                                    <mat-form-field class="input-field">
                                        <input type="password" matInput placeholder="Password (conf)" formControlName="passwordExternalConfirm">
                                        <mat-error *ngIf="this.formGroup?.get('externalToUniversityGroup.passwordExternalConfirm')?.hasError('required')">
                                            This field is required
                                        </mat-error>
                                        <mat-error *ngIf="this.formGroup?.get('externalToUniversityGroup.passwordExternalConfirm')?.hasError('validatePasswordConfirm')">
                                            The password doesn't match
                                        </mat-error>
                                    </mat-form-field>
                                </div>
                                <div class="text-body">
                                    {{ this.passwordUtilService.PASSWORD_COMPLEXITY_REQUIREMENTS }}
                                </div>

                            </div>
                        </ng-template>
                    </div>
                    <div class="flex-row-container justify-flex-end">
                        <button type="submit" mat-raised-button [color]="color" [disabled]="this.formGroup.invalid" >Submit</button>
                    </div>

                </form>
            </div>
        </div>






    `
    ,
    styles: [`

        .spaced-children > *:not(:last-child) {
            margin-right: 1em;
        }
        div.container {
            width: 1100px;
            min-width: 900px;
        }
        div.header {
            margin-bottom: 25px;
        }
        form.main-form {
            width: 900px;
            padding: 10px;
        }
        div.text-body {
            padding-top: 10px;
            text-align: center;
        }
        .input-field {
            width: 20em;
        }
    `]
})
export class RegisterUserComponent  implements OnInit, OnDestroy{
    private registerUser: IRegisterUser;
    private labs: ISimpleLab[];
    private isUniversityAuthd: string;
    private publicNotice: string;
    public siteLogo: string;
    public formGroup: FormGroup;
    private newLabGroupTemplate: any;
    private emailRegex: RegExp  = /^[a-zA-Z][a-zA-Z\d]*(\.[a-zA-Z\d]+)*@\d*[a-zA-Z](([a-zA-Z\d]*)|([\-a-zA-Z\d]+[a-zA-Z\d]))(\.[a-zA-Z\d]+)+$/;
    private externalToGroupTemplate: any;
    public color: string = "primary";
    private idCoreFacility: string;

    constructor(private route: ActivatedRoute, private dialogService: DialogsService,
                private fb: FormBuilder, public passwordUtilService: PasswordUtilService,
                private userService: UserService) {
    }

    ngOnInit(): void {
        let extUsrnameRegex = /^u\d{7}\d?$/i;
        this.externalToGroupTemplate = {
            institute: '',
            userNameExternal: ['', [Validators.required, invalidExternalUsrName('uofuAffiliate',extUsrnameRegex)]],
            passwordExternal: ['', [Validators.required, PasswordUtilService.validatePassword]],
            passwordExternalConfirm: ['', [Validators.required, PasswordUtilService.validatePasswordConfirm('passwordExternal')]],
        };
        this.newLabGroupTemplate = {
            newLabFirstName: ['', Validators.required],
            newLabLastName: ['', Validators.required],
            department: [''],
            contactEmail: ['', [Validators.required, Validators.pattern(this.emailRegex)]],
            contactPhone: ['', Validators.required],
        };
        this.formGroup = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.pattern(this.emailRegex)]],
            phone: ['', Validators.required],
            labToggler: false,
            labDropdown: ['', Validators.required],
            uofuAffiliate: true,
            uNID: ['', [Validators.required, Validators.pattern(/u\d{7}/)]],
        });


        this.route.data.forEach(resp => {
            if(resp ) {
                let regUserResp: any = resp.registerUserInfo;
                if(regUserResp && regUserResp.result === "SUCCESS") {
                    this.registerUser = <IRegisterUser>regUserResp;
                    this.labs = this.registerUser.Labs && this.registerUser.Labs.length > 0 ? this.registerUser.Labs : [];
                    this.isUniversityAuthd = this.registerUser.isUniversityUserAuthentication;
                    this.publicNotice = this.registerUser.publicDataNotice ? this.registerUser.publicDataNotice : "";
                    this.siteLogo = this.registerUser.siteLogo ? this.registerUser.siteLogo : "";


                    if(!this.isUniversityAuthd) {
                        this.formGroup.get('uofuAffiliate').setValue(false);
                    }

                } else if(regUserResp && regUserResp.message) {
                    this.dialogService.alert(regUserResp.message, "", DialogType.FAILED);
                }
            }
        });
        this.route.paramMap.subscribe( param => {
            this.idCoreFacility = param.get('idCoreFacility');
        });

    }

    toggledLabState(event: MatSlideToggleChange) {
        if(event.checked) {
            console.log("is a new Lab");
            this.formGroup.removeControl("labDropdown");
            if(!this.formGroup.get("newLabGroup")) {
                this.formGroup.addControl("newLabGroup", this.fb.group(this.newLabGroupTemplate));
            }
        } else {
            console.log("is existing lab");
            this.formGroup.removeControl("newLabGroup");
            if(!this.formGroup.get("labDropdown")) {
                this.formGroup.addControl('labDropdown', new FormControl('', Validators.required));
            }
        }
    }
    toggledUniversityState(event: MatSlideToggleChange) {
        if(event.checked) {
            console.log("is existing university employee");
            this.formGroup.removeControl("externalToUniversityGroup");
            if(!this.formGroup.get("uNID")) {
                this.formGroup.addControl("uNID", new FormControl('', [Validators.required, Validators.pattern(/u\d{7}/) ]));
            }
        } else {
            console.log("is external university");
            this.formGroup.removeControl("uNID");
            if(!this.formGroup.get("externalToUniversityGroup")) {
                this.formGroup.addControl('externalToUniversityGroup', this.fb.group(this.externalToGroupTemplate));
            }
        }

    }

    submit(formGroup: FormGroup) {
        let params = new HttpParams({encoder: new HttpUriEncodingCodec()});
        Object.keys(formGroup.controls).forEach(key => {
            let control: any = formGroup.get(key).value;
            let keyList: any[] = Object.keys(control);
            if (keyList.length > 0 && typeof control === 'object') {
                for (let k of keyList) {
                    let c = control[k];
                    if (typeof control === "boolean") {
                        let decisionStr = control ? 'Y' : 'N';
                        params = params.set(k, decisionStr);
                    } else if (c) {
                        params = params.set(k, c);
                    }
                }
            } else {
                if (typeof control === "boolean") {
                    let decisionStr = control ? 'Y' : 'N';
                    params = params.set(key, decisionStr);
                } else if (control) {
                    params = params.set(key, <string>control);
                }

            }

        });
        params = params.set("idFacility", this.idCoreFacility);


        this.userService.saveSelfRegisteredAppUser(params).subscribe(resp => {
            if (resp) {
                console.log(resp);
            }
        });
    }

    ngOnDestroy() {
    }

}





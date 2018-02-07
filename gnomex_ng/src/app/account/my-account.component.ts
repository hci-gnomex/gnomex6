import {Component} from "@angular/core";
import {URLSearchParams, Response} from "@angular/http";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {PasswordUtilService} from "../services/password-util.service";
import {AppUserPublicService} from "../services/app-user-public.service";
import {MatSnackBar} from "@angular/material";

@Component({
    selector: 'my-account',
    templateUrl: "./my-account.component.html",
})

export class MyAccountComponent {
    public readonly USER_TYPE_UNIVERSITY: string = "u";
    public readonly USER_TYPE_EXTERNAL: string = "e";
    private readonly DUMMY_UNID: string = "u0000000";
    private readonly DUMMY_USERNAME: string = "_";
    private readonly DUMMY_PASSWORD: string = "aaAA11$$";
    private readonly PASSWORD_MASKED: string = "XXXX";

    public allFG: FormGroup;
    public firstNameFC: FormControl;
    public lastNameFC: FormControl;
    public emailFC: FormControl;
    public phoneFC: FormControl;
    public institutionFC: FormControl;
    public departmentFC: FormControl;
    public urlFC: FormControl;
    public unidFC: FormControl;
    public usernameFC: FormControl;
    public passwordFC: FormControl;
    public passwordConfirmFC: FormControl;

    public userType: string = "";
    public showSpinner: boolean = false;
    public showRequestLabMembership: boolean = false;
    public notifyGridColumnDefs: any[];
    public notifyGridRowData: any[];
    private notifyGridApi: any;
    private notifyLabsChanged: any[];

    constructor(public createSecurityAdvisorService: CreateSecurityAdvisorService,
                public passwordUtilService: PasswordUtilService,
                private appUserPublicService: AppUserPublicService,
                private snackBar: MatSnackBar) {
        this.firstNameFC = new FormControl("", Validators.required);
        this.lastNameFC = new FormControl("", Validators.required);
        this.emailFC = new FormControl("", [Validators.required, Validators.email]);
        this.phoneFC = new FormControl("");
        this.institutionFC = new FormControl("");
        this.departmentFC = new FormControl("");
        this.urlFC = new FormControl("");
        this.unidFC = new FormControl("", [Validators.required, Validators.pattern("^u[0-9]{7}$")]);
        this.usernameFC = new FormControl("", Validators.required);
        this.passwordFC = new FormControl("", MyAccountComponent.validatePassword);
        this.passwordConfirmFC = new FormControl("", MyAccountComponent.validatePasswordConfirm);

        this.allFG = new FormGroup({
            firstName: this.firstNameFC,
            lastName: this.lastNameFC,
            email: this.emailFC,
            phone: this.phoneFC,
            institution: this.institutionFC,
            department: this.departmentFC,
            url: this.urlFC,
            unid: this.unidFC,
            username: this.usernameFC,
            password: this.passwordFC,
            passwordConfirm: this.passwordConfirmFC,
        });
        this.passwordFC.setParent(this.allFG);
        this.passwordConfirmFC.setParent(this.allFG);

        if (!this.createSecurityAdvisorService.isAdmin && !this.createSecurityAdvisorService.isSuperAdmin) {
            this.showRequestLabMembership = true;
        }

        this.notifyGridColumnDefs = [
            {headerName: "Lab", field: "labName", checkboxSelection: true, headerCheckboxSelection: false, width: 100},
            {headerName: "Role", field: "role", width: 100},
        ];
        this.notifyGridRowData = [];
        this.notifyLabsChanged = [];

        this.appUserPublicService.getAppUserPublic(this.createSecurityAdvisorService.idAppUser.toString()).subscribe((response: any) => {
            if (response) {
                this.firstNameFC.setValue(response.firstName);
                this.lastNameFC.setValue(response.lastName);
                this.emailFC.setValue(response.email);
                this.phoneFC.setValue(response.phone);
                this.institutionFC.setValue(response.institute);
                this.departmentFC.setValue(response.department);
                this.urlFC.setValue(response.ucscUrl);
                if (response.userNameExternal && response.userNameExternal != "") {
                    this.resetUserType(true);
                    this.userType = this.USER_TYPE_EXTERNAL;
                    this.usernameFC.setValue(response.userNameExternal);
                    this.passwordFC.setValue(this.DUMMY_PASSWORD);
                    this.passwordConfirmFC.setValue(this.DUMMY_PASSWORD);
                } else if (response.uNID && response.uNID != "") {
                    this.resetUserType(false);
                    this.userType = this.USER_TYPE_UNIVERSITY;
                    this.unidFC.setValue(response.uNID);
                }

                if (response.notificationLabs) {
                    if (response.notificationLabs.Lab) {
                        let newData: any[] = [];
                        newData.push(response.notificationLabs.Lab);
                        this.notifyGridRowData = newData;
                    } else if (Array.isArray(response.notificationLabs)) {
                        this.notifyGridRowData = response.notificationLabs;
                    }
                }
            }
        });
    }

    private resetUserType(isExternal: boolean): void {
        if (isExternal) {
            this.unidFC.setValue(this.DUMMY_UNID);
            this.usernameFC.setValue("");
            this.passwordFC.setValue("");
            this.passwordConfirmFC.setValue("");
        } else {
            this.unidFC.setValue("");
            this.usernameFC.setValue(this.DUMMY_USERNAME);
            this.passwordFC.setValue(this.DUMMY_PASSWORD);
            this.passwordConfirmFC.setValue(this.DUMMY_PASSWORD);
        }
    }

    public onUserTypeChange(event: any): void {
        if (event.value === this.USER_TYPE_UNIVERSITY) {
            this.resetUserType(false);
        } else if (event.value === this.USER_TYPE_EXTERNAL) {
            this.resetUserType(true);
        }
    }

    private static validatePassword(c: FormControl): any {
        return PasswordUtilService.passwordMeetsRequirements(c.value) ? null : {'validatePassword': {value: c.value}};
    }

    private static validatePasswordConfirm(c: FormControl): any {
        if (c.parent) {
            let parent: FormGroup = c.parent as FormGroup;
            if (c.value != '' && c.value === parent.controls['password'].value) {
                return null;
            }
        }
        return {'validatePasswordConfirm': {value: c.value}};
    }

    public onNotifyGridReady(params: any): void {
        this.notifyGridApi = params.api;
        this.notifyGridApi.sizeColumnsToFit();
    }

    public onNotifyGridRowDataChanged(): void {
        if (this.notifyGridApi) {
            this.notifyGridApi.forEachNode((node: any) => {
                if (node.data.doUploadAlert === "Y") {
                    node.setSelected(true);
                }
            });
            this.notifyLabsChanged = [];
            setTimeout(() => {
                this.allFG.markAsPristine();
            });
        }
    }

    public onNotifyGridRowSelected(event: any): void {
        let found: boolean = false;
        for (let index = 0; index < this.notifyLabsChanged.length; index++) {
            let lab: any = this.notifyLabsChanged[index];
            if (lab.idLab === event.data.idLab && lab.role === event.data.role) {
                found = true;
                lab.doUploadAlert = event.node.selected ? "Y" : "N";
                break;
            }
        }
        if (!found) {
            event.data.doUploadAlert = event.node.selected ? "Y" : "N";
            this.notifyLabsChanged.push(event.data);
        }
    }

    public onNotifyGridSelectionChanged(): void {
        this.allFG.markAsDirty();
    }

    public save(): void {
        this.showSpinner = true;
        let params: URLSearchParams = new URLSearchParams();
        params.set("idAppUser", this.createSecurityAdvisorService.idAppUser.toString());
        params.set("firstName", this.firstNameFC.value);
        params.set("lastName", this.lastNameFC.value);
        params.set("institute", this.institutionFC.value);
        params.set("department", this.departmentFC.value);
        params.set("email", this.emailFC.value);
        params.set("phone", this.phoneFC.value);
        params.set("ucscUrl", this.urlFC.value);
        params.set("isActive", "Y");
        if (this.userType === this.USER_TYPE_UNIVERSITY) {
            params.set("uNID", this.unidFC.value);
        } else if (this.userType === this.USER_TYPE_EXTERNAL) {
            params.set("userNameExternal", this.usernameFC.value);
            params.set("passwordExternal", this.passwordFC.value === this.DUMMY_PASSWORD ? this.PASSWORD_MASKED : this.passwordFC.value);
        }
        if (this.notifyLabsChanged.length > 0) {
            params.set("userNotificationLabsJSONString", JSON.stringify(this.notifyLabsChanged));
            params.set("noJSONToXMLConversionNeeded", "Y");
        }

        this.appUserPublicService.saveAppUserPublic(params).subscribe((response: Response) => {
            if (response.status === 200) {
                let responseJSON: any = response.json();
                if (responseJSON.result && responseJSON.result === "SUCCESS") {
                    this.allFG.markAsPristine();
                    this.snackBar.open("Changes Saved", "My Account", {
                        duration: 2000,
                    });
                }
            }
            this.showSpinner = false;
        });
    }

    public showRequestLabMembershipDialog(): void {
        if (this.showRequestLabMembership) {
            // TODO
        }
    }

}
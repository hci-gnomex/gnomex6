import {Component} from "@angular/core";
import {HttpParams} from "@angular/common/http";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {PasswordUtilService} from "../services/password-util.service";
import {AppUserPublicService} from "../services/app-user-public.service";
import {MatSnackBar} from "@angular/material";
import {LabMembershipRequestComponent} from "./lab-membership-request.component";
import {DialogsService} from "../util/popup/dialogs.service";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {HttpUriEncodingCodec} from "../services/interceptors/http-uri-encoding-codec";

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
                private snackBar: MatSnackBar,
                private dialogsService: DialogsService) {
        this.firstNameFC = new FormControl("", Validators.required);
        this.lastNameFC = new FormControl("", Validators.required);
        this.emailFC = new FormControl("", [Validators.required, Validators.email]);
        this.phoneFC = new FormControl("");
        this.institutionFC = new FormControl("");
        this.departmentFC = new FormControl("");
        this.urlFC = new FormControl("");
        this.unidFC = new FormControl("", [Validators.required, Validators.pattern("^u[0-9]{7}$")]);
        this.usernameFC = new FormControl("", Validators.required);
        this.passwordFC = new FormControl("", PasswordUtilService.validatePassword);
        this.passwordConfirmFC = new FormControl("", PasswordUtilService.validatePasswordConfirm());

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
            if (response && response.idAppUser) {
                this.firstNameFC.setValue(response.firstName);
                this.lastNameFC.setValue(response.lastName);
                this.emailFC.setValue(response.email);
                this.phoneFC.setValue(response.phone);
                this.institutionFC.setValue(response.institute);
                this.departmentFC.setValue(response.department);
                this.urlFC.setValue(response.ucscUrl);
                if (response.userNameExternal && response.userNameExternal !== "") {
                    this.resetUserType(true);
                    this.userType = this.USER_TYPE_EXTERNAL;
                    this.usernameFC.setValue(response.userNameExternal);
                    this.passwordFC.setValue(this.DUMMY_PASSWORD);
                    this.passwordConfirmFC.setValue(this.DUMMY_PASSWORD);
                } else if (response.uNID && response.uNID !== "") {
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
            } else {
                // TODO: remove this later once error caught by the interceptor
                let message: string = response && response.message ? response.message : "";
                this.dialogsService.error("An error occurred while getting appUserPublic. " + message);
            }
        }, (err: IGnomexErrorResponse) => {
            // TODO: Need to check on back-end to see why it can't catch errors
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
        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
            .set("idAppUser", this.createSecurityAdvisorService.idAppUser.toString())
            .set("firstName", this.firstNameFC.value)
            .set("lastName", this.lastNameFC.value)
            .set("institute", this.institutionFC.value)
            .set("department", this.departmentFC.value)
            .set("email", this.emailFC.value)
            .set("phone", this.phoneFC.value)
            .set("ucscUrl", this.urlFC.value)
            .set("isActive", "Y");
        if (this.userType === this.USER_TYPE_UNIVERSITY) {
            params = params.set("uNID", this.unidFC.value);
        } else if (this.userType === this.USER_TYPE_EXTERNAL) {
            params = params.set("userNameExternal", this.usernameFC.value);
            params = params.set("passwordExternal", this.passwordFC.value === this.DUMMY_PASSWORD ? this.PASSWORD_MASKED : this.passwordFC.value);
        }
        if (this.notifyLabsChanged.length > 0) {
            params = params.set("userNotificationLabsJSONString", JSON.stringify(this.notifyLabsChanged));
            params = params.set("noJSONToXMLConversionNeeded", "Y");
        }

        this.appUserPublicService.saveAppUserPublic(params).subscribe((response: any) => {
            if(response && response.result && response.result === "SUCCESS") {
                this.allFG.markAsPristine();
                this.snackBar.open("Changes Saved", "My Account", {
                    duration: 2000,
                });
            }
            this.showSpinner = false;
        }, (err: IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }

    public showRequestLabMembershipDialog(): void {
        if (this.showRequestLabMembership) {
            this.dialogsService.genericDialogContainer(LabMembershipRequestComponent, "Request Lab Membership (Choose Labs)", null, null,
                {actions: [
                        {type: ActionType.PRIMARY, name: "Request", internalAction: "request"},
                        {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                    ]});
        }
    }

}

import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {AppUserListService} from "../services/app-user-list.service";
import {Subscription} from "rxjs/Subscription";
import {GridOptions, RowDataChangedEvent} from "ag-grid/main";
import { URLSearchParams } from "@angular/http";
import {LabListService} from "../services/lab-list.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {GnomexService} from "../services/gnomex.service";
import {NewUserDialogComponent} from "./new-user-dialog.component";
import {MatDialog, MatDialogRef} from "@angular/material";
import {PasswordUtilService} from "../services/password-util.service";
import {MatSnackBar} from "@angular/material";
import {DialogsService} from "../util/popup/dialogs.service";

/**
 * @title Basic tabs
 */
@Component({
    selector: 'users-groups-tablist',
    templateUrl: './users-groups-tablist.component.html',
    styles: [`
        .flex-column-container {
            display: flex;
            flex-direction: column;
            background-color: white;
            height: 100%;
        }

        .flex-row-container {
            display: flex;
            flex-direction: row;
        }

        .users-groups-row-one {
            display: flex;
            flex-grow: 1;
        }

        .users-groups-row-one-shrink {
            display: flex;
            flex-grow: 1;
            flex-shrink: 1;
            min-width: 0;
        }

        .users-groups-type-row {
            display: flex;
            flex-grow: .2;
        }

        .users-groups-unid-row {
            display: flex;
            flex-grow: .1;
        }

        .users-groups-item-row-two {
            flex-grow: 1;
            position: relative;
        }

        .users-groups-item {
            width: 100%;
            flex: 1 1 auto;
            font-size: small;
        }

        .users-groups-one {
            width: 100%;
            flex-grow: .1;

        }

        .users-groups-help-drag-drop {
            width: 100%;
            flex-grow: .10;
        }

        .users-groups-three {
            width: 100%;
            height: 5px;
            flex-grow: 3;
        }

        .users-groups-four {
            width: 100%;
            flex-grow: .10;
        }

        /deep/ .mat-tab-body-wrapper {
            flex-grow: 1 !important;
        }
        
        div.background {
            width: 100%;
            height: 100%;
            background-color: #EEEEEE;
            padding: 0.3em;
            border-radius: 0.3em;
            border: 1px solid darkgrey;
            display: flex;
            flex-direction: column;
        }
        .ug-background {
            background-color: #EEEEEE;
            padding: 0.3em;
            border-radius: 0.3em;
            border: 1px solid darkgrey;
        }
        .ug-white-background {
            padding: 0.3em;
            border-radius: 0.3em;
            border: 1px solid darkgrey;
        }
        .permission-radio-group {
            display: inline-flex;
            flex-direction: column;
        }
        .ug-label {
            width: 8rem;
            height: 2.6em;
            vertical-align: middle;
            font-style: italic;
            color: #1601db;
        }
        .flex-container{

            display: flex;
            justify-content: space-between;
            margin-left: auto;
            margin-top: 1em;
            padding-left: 1em;
        }
        div.form {
            display: flex;
            flex-direction: column;
            padding: 0 1%;
        }
        div.formRow {
            display: flex;
            flex-direction: row;
            margin: 0.5% 0;
            width: 80%;
        }
        mat-form-field.formField {
            width: 30%;
            margin: 0 0.5%;
        }

    `]

})

export class UsersGroupsTablistComponent implements OnInit{
    public readonly USER_TYPE_UNIVERSITY: string = "uu";
    public readonly USER_TYPE_EXTERNAL: string = "ex";
    private readonly DUMMY_UNID: string = "u0000000";
    private readonly DUMMY_USERNAME: string = "_";
    private readonly DUMMY_PASSWORD: string = "aaAA11$$";
    private readonly PASSWORD_MASKED: string = "XXXX";

    private columnDefs;
    private labColumnDefs;
    private collColumnDefs;
    private manColumnDefs;
    private groupsColumnDefs;
    private getAppUserListSubscription: Subscription;
    private getGroupListSubscription: Subscription;
    public rowData:Array<any> =[];
    private gridOptions:GridOptions = {};
    private labGridOptions:GridOptions = {};
    private collGridOptions:GridOptions = {};
    private manGridOptions:GridOptions = {};
    private groupsGridOptions:GridOptions = {};
    private rowSelection;
    private idAppUser;
    private appUser: any;
    private groupsData: any[] = [];
    private labs: any[] = [];
    public collaboratingLabs: any[] = [];
    public managingLabs: any[] = [];
    public isUserTab: boolean = true;
    public isGroupsTab: boolean = false;
    private userForm: FormGroup;
    private selectedUser: any = "";
    private isActive: boolean;
    public passwordFC: FormControl;
    public passwordConfirmFC: FormControl;
    public unidFC: FormControl;
    public usernameFC: FormControl;
    public usertypeFC: FormControl;
    public emailFC: FormControl;
    public permissionLevelFC: FormControl;
    public isActiveFC: FormControl;
    public codeUserPermissionKind: string;
    public coreFacilitiesICanSubmitTo: any[];
    public coreFacilitiesIManage: any[];
    public searchText: string;
    public selectedTab: number = 0;
    public showSpinner: boolean = false;
    private columnWidth: number;
    private isActiveChanged: boolean = false;
    private beingIsActive: boolean = false;

    constructor(private secAdvisor: CreateSecurityAdvisorService,
                public passwordUtilService: PasswordUtilService,
                private appUserListService: AppUserListService,
                private groupListService: LabListService,
                private formBuilder: FormBuilder,
                private gnomexService: GnomexService,
                private snackBar: MatSnackBar,
                private dialogsService: DialogsService,
                private dialog: MatDialog
                ) {
        this.columnDefs = [
            {
                headerName: "",
                editable: false,
                field: "displayName",
                width: 200
            },
            {
                headerName: "",
                editable: false,
                field: "email",
            }
        ];
        this.groupsColumnDefs = [
            {
                editable: false,
                field: "name",
            }
        ];
        this.labColumnDefs = [
            {
                headerName: "Labs",
                editable: false,
                field: "name",
            },
        ];
        this.collColumnDefs = [
            {
                headerName: "Collaborating Labs",
                editable: false,
                field: "name",
            }
        ];
        this.manColumnDefs = [
            {
                headerName: "Managing Labs",
                editable: false,
                field: "name",
            }
        ];
        this.rowSelection = "single";
    }

    ngOnInit() {
        if (!this.secAdvisor.isLabManager) {
            this.getAppUserListSubscription = this.appUserListService.getFullAppUserList().subscribe((response: any[]) => {
                this.createUserForm();
                this.userForm.markAsPristine();

                this.rowData = response;
            });
        }
        this.getGroupListSubscription = this.groupListService.getLabList().subscribe((response: any[]) => {
            this.groupsData = response;
        });
    }

    public onNotifyGridRowDataChanged(): void {
        setTimeout(() => {
            this.userForm.markAsPristine();
        });
    }

    public onSplitDragEnd(event) {
        this.gridOptions.api.sizeColumnsToFit();
        this.groupsGridOptions.api.sizeColumnsToFit();
        this.labGridOptions.api.sizeColumnsToFit();
        this.manGridOptions.api.sizeColumnsToFit();
        this.collGridOptions.api.sizeColumnsToFit();

    }

    public onGridSizeChanged(): void {
        // this.columnWidth = document.getElementById('myTable').clientWidth;

        setTimeout(() => {
            this.gridOptions.api.sizeColumnsToFit();
        });
    }

    public onManGridSizeChanged(): void {
        // this.columnWidth = document.getElementById('myTable').clientWidth;

        setTimeout(() => {
            this.manGridOptions.api.sizeColumnsToFit();
        });
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

    setUserValues() {
        for (let core of this.coreFacilitiesICanSubmitTo) {
            this.userForm.controls[core.display].patchValue(core.isSelected, {onlySelf: true, emitEvent: true});

        }
        for (let core of this.coreFacilitiesIManage) {
            this.userForm.controls[core.display + 'm'].patchValue(core.isSelected, {onlySelf: true, emitEvent: true});

        }
        this.userForm
            .patchValue({
                firstName: this.selectedUser.firstName,
                lastName: this.selectedUser.lastName,
                phone: this.selectedUser.phone,
                email: this.selectedUser.email,
                isActive: this.isActive,
                ucscUrl: this.selectedUser.ucscUrl,
                department: this.selectedUser.department,
                institute: this.selectedUser.institute,
                uNid: this.selectedUser.uNID,
                permissionLevel: this.codeUserPermissionKind,
                userName: this.selectedUser.DUMMY_USERNAME,
                password: this.DUMMY_PASSWORD,
                confirm: this.DUMMY_PASSWORD
            });
    }

    createUserForm() {
        this.passwordFC = new FormControl("", UsersGroupsTablistComponent.validatePassword);
        this.passwordConfirmFC = new FormControl("", UsersGroupsTablistComponent.validatePasswordConfirm);
        this.unidFC = new FormControl("", [Validators.required, Validators.pattern("^u[0-9]{7}$")]);
        this.usernameFC = new FormControl("", Validators.required);
        this.usertypeFC = new FormControl("", Validators.required);
        this.emailFC = new FormControl("", [Validators.required, Validators.email]);
        this.permissionLevelFC = new FormControl("", Validators.required);
        this.isActiveFC = new FormControl("");
        this.userForm = this.formBuilder.group({
            lastName: ['', [
                Validators.required
            ]],
            firstName: ['', [
                Validators.required
            ]],
            email: this.emailFC,
            phone: "",
            isActive: this.isActiveFC,
            "ucscUrl": '',
            "institute": '',
            "department": '',
            uNid: this.unidFC,
            userType: this.usertypeFC,
            permissionLevel: this.permissionLevelFC,
            userName: this.usernameFC,
            password: this.passwordFC,
            passwordConfirm: this.passwordConfirmFC,
        })
        this.passwordFC.setParent(this.userForm);
        this.passwordConfirmFC.setParent(this.userForm);

    }

    search() {

        this.gridOptions.api.setQuickFilter(this.searchText);
    }

    /**
     *
     */
    onSelectionChanged() {
        var params: URLSearchParams = new URLSearchParams();
        var selectedRows = this.gridOptions.api.getSelectedRows();
        this.idAppUser = selectedRows[0].idAppUser;
        params.set("idAppUser", this.idAppUser);
        this.getAppUserListSubscription = this.appUserListService.getAppUser(params).subscribe((response: any) => {
            this.selectedUser = response.AppUser;
            if (this.selectedUser.isActive === 'N') {
                this.isActive = false;
            } else {
                this.isActive = true;
            }
            this.selectPermissionLevel(response.AppUser.codeUserPermissionKind);
            this.appUser = response;
            this.selectSubmissionCheckbox(response);
            this.setUserValues();
            if (response.AppUser.isExternalUser === 'N') {
                this.resetUserType(false);
                this.usertypeFC.setValue(this.USER_TYPE_UNIVERSITY);
                this.unidFC.setValue(response.AppUser.uNID);
            } else {
                this.resetUserType(true);
                this.usertypeFC.setValue(this.USER_TYPE_EXTERNAL);
                this.usernameFC.setValue(response.AppUser.userNameExternal);
                this.passwordFC.setValue(this.DUMMY_PASSWORD);
                this.passwordConfirmFC.setValue(this.DUMMY_PASSWORD);
            }
            if (!this.secAdvisor.isArray(response.AppUser.labs)) {
                this.labs = [response.AppUser.labs.Lab];
            } else {
                this.labs = response.AppUser.labs;
            }

            if (!this.secAdvisor.isArray(response.AppUser.collaboratingLabs)) {
                this.collaboratingLabs = [response.AppUser.collaboratingLabs.Lab];
            } else {
                this.collaboratingLabs = response.AppUser.collaboratingLabs;
            }

            if (!this.secAdvisor.isArray(response.AppUser.managingLabs)) {
                this.managingLabs = [response.AppUser.managingLabs.Lab];
            } else {
                this.managingLabs = response.AppUser.managingLabs;
            }
            this.userForm.markAsPristine();
            if (this.secAdvisor.isAdmin && !this.secAdvisor.isSuperAdmin && this.selectedUser.codeUserPermissionKind == 'SUPER') {
                this.userForm.disable();
            }
        });

    }

    /**
     *
     * @param permissionKind
     */
    selectPermissionLevel(permissionKind: any) {
        this.codeUserPermissionKind = this.selectedUser.codeUserPermissionKind;
        if (this.selectedUser.isActive === 'Y') {
            this.isActive = true;
        } else {
            this.isActive = false;
        }
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

    public onPermissionLevelChange(event: any): void {
        this.codeUserPermissionKind = event.value;
        this.selectSubmissionCheckbox(this.appUser);
        this.setUserValues();
        if (this.selectedUser.isExternalUser === 'N') {
            this.usernameFC.setValue(this.DUMMY_USERNAME);
            this.usertypeFC.setValue(this.USER_TYPE_UNIVERSITY);
        } else {
            this.usernameFC.setValue(this.appUser.AppUser.userNameExternal);
            this.unidFC.setValue(this.DUMMY_UNID);
            this.usertypeFC.setValue(this.USER_TYPE_EXTERNAL);
        }
    }

    public onUserTypeChange(event: any): void {
        this.passwordConfirmFC.markAsPristine();
        this.passwordFC.markAsPristine();
        this.usernameFC.markAsPristine();
        this.userForm.patchValue({userType: event.value });
        if (event.value === this.USER_TYPE_UNIVERSITY) {
            this.resetUserType(false);
        } else if (event.value === this.USER_TYPE_EXTERNAL) {
            this.resetUserType(true);
        }
    }

    public onIsActiveChange(event) {
        this.isActiveChanged = true;
    }

    onTabChange(event) {
        if (event.tab.textLabel === "Groups") {
            this.isUserTab = false;
            this.isGroupsTab = true;
        } else {
            this.isUserTab = true;
            this.isGroupsTab = false;
        }
    }

    selectSubmissionCheckbox(getAppUser: any) {
        // Have to build checkboxes on the fly
        this.coreFacilitiesICanSubmitTo = [];
        this.coreFacilitiesIManage = [];
        if (this.codeUserPermissionKind === 'LAB' || this.codeUserPermissionKind === 'BILLING' || this.codeUserPermissionKind == 'ADMIN') {
            this.coreFacilitiesICanSubmitTo = getAppUser.coreFacilitiesICanSubmitTo.filter((core) => {
                return core.allowed === 'Y';
            })
        }
        if (this.codeUserPermissionKind === 'BILLING' || this.codeUserPermissionKind==='ADMIN' ) {
            this.coreFacilitiesIManage = getAppUser.managingCoreFacilities;
            for (let core of this.coreFacilitiesIManage) {
                if (core.selected ==='Y') {
                    core.isSelected = true;
                } else {
                    core.isSelected = false;
                }
                for (let core of this.coreFacilitiesIManage) {
                    core.mDisplay = core.display + 'm';
                    let control: FormControl = new FormControl(core.display + 'm');
                    this.userForm.addControl(core.display + 'm', control);
                }
            }

        }

        for (let core of this.coreFacilitiesICanSubmitTo) {
            if (core.selected ==='Y') {
                core.isSelected = true;
            } else {
                core.isSelected = false;
            }
        }


        for (let core of this.coreFacilitiesICanSubmitTo) {
            let control: FormControl = new FormControl(core.display);
            this.userForm.addControl(core.display, control);
        }
    }

    onGroupsTabChange(event) {

    }

    dataChanged(): void {
    }

    newUser() {
        let dialogRef: MatDialogRef<NewUserDialogComponent> = this.dialog.open(NewUserDialogComponent, {
            height: '25em',
            width: '20em',
        });
    }

    deleteUser() {

    }

    onGridReady(params) {
        this.gridOptions.columnApi.setColumnVisible('email', false);
        let api = params.api;
        let filter = api.getFilterInstance("displayName");
        this.gridOptions.api.sizeColumnsToFit();

    }

    onLabGridReady(params) {
        this.labGridOptions.api.sizeColumnsToFit();

    }
    onCollGridReady(params) {
        this.collGridOptions.api.sizeColumnsToFit();

    }
    onManGridReady(params) {
        this.manGridOptions.api.sizeColumnsToFit();

    }
    onGroupsGridReady(params) {
        this.groupsGridOptions.api.sizeColumnsToFit();

    }
    setCoreFacilities(): number {
        let coresIManage: number = 0;
        for (let field in this.userForm.controls) { // 'field' is a string
            let control = this.userForm.get(field);
            for (let core of this.coreFacilitiesICanSubmitTo) {
                if (core.display === field) {
                    if (control.value) {
                        core.selected = 'Y';
                    } else {
                        core.selected = 'N';
                    }
                }
            }
            for (let core of this.coreFacilitiesIManage) {
                if (core.mDisplay === field) {
                    if (control.value) {
                        core.selected = 'Y';
                        coresIManage++;

                    } else {
                        core.selected = 'N';
                    }
                }
            }
        }
        return coresIManage;
    }

    buildLabsMessage (): string {
        let message: string = "";
        for (let lab of this.labs) {
            message = message.concat(lab.name + " as a member");
            message = message.concat(", ");
        }
        for (let lab of this.collaboratingLabs) {
            message = message.concat(lab.name + " as a collaborator");
            message = message.concat(", ");
        }
        for (let lab of this.managingLabs) {
            message = message.concat(lab.name) + " as a manager";
            message = message.concat(", ");
        }
        message = message.substring(0, message.lastIndexOf(","));
        return message;
    }


    save() {
        let stringifiedSF: string = "";
        let stringifiedMF: string = "";
        this.showSpinner = true;
        let params: URLSearchParams = new URLSearchParams();
        params.set("idAppUser", this.idAppUser);
        params.set("codeUserPermissionKind", this.codeUserPermissionKind);
        params.set("idAppUser", this.selectedUser.idAppUser.toString());
        params.set("firstName", this.userForm.controls['firstName'].value);
        params.set("lastName", this.userForm.controls['lastName'].value);
        params.set("institute", this.userForm.controls['institute'].value);
        params.set("department", this.userForm.controls['department'].value);
        params.set("email", this.userForm.controls['email'].value);
        params.set("phone", this.userForm.controls['phone'].value);
        params.set("ucscUrl", this.userForm.controls['ucscUrl'].value);
        if (this.isActiveFC.value === false) {
            params.set("isActive", 'N');
        } else {
            params.set("isActive", 'Y');
        }
        if (this.beingIsActive === false) {
            params.set("beingInactivated", 'N');
        } else {
            params.set("beingInactivated", 'Y');
        }
        //params.set("isActive", this.userForm.controls['isActive'].value);
        if (this.usertypeFC.value === this.USER_TYPE_UNIVERSITY) {
            params.set("uNID", this.userForm.controls['uNid'].value);
        } else if (this.usertypeFC.value === this.USER_TYPE_EXTERNAL) {
            params.set("userNameExternal", this.userForm.controls['userName'].value);
            params.set("passwordExternal", this.userForm.controls['password'].value === this.DUMMY_PASSWORD ? this.PASSWORD_MASKED : this.userForm.controls['password'].value.value);
            params.set("uNID", "");
        }
        if (this.coreFacilitiesICanSubmitTo.length > 0) {
            stringifiedSF = JSON.stringify(this.coreFacilitiesICanSubmitTo);
        }
        if (this.coreFacilitiesIManage.length > 0) {
            stringifiedMF = JSON.stringify(this.coreFacilitiesIManage);
        }
        params.set("coreFacilitiesUserCanSubmitTo", stringifiedSF);
        params.set("userManagingCoreFacilities", stringifiedMF);
        this.userForm.markAsPristine();
        this.appUserListService.saveAppUser(params).subscribe((response: Response) => {
            if (response.status === 200) {
                let responseJSON: any = response.json();
                if (responseJSON.result && responseJSON.result === "SUCCESS") {
                    this.userForm.markAsPristine();
                    this.snackBar.open("Changes Saved", "My Account", {
                        duration: 2000,
                    });
                }
            }
            this.showSpinner = false;
        });

    }

    saveUser() {
        let coresIManage = this.setCoreFacilities();

        if (this.codeUserPermissionKind === 'ADMIN' && coresIManage === 0) {
            this.dialogsService.confirm("The user is marked as an admin; Please specify the core facilities the user can manage.", null);
        } else {
            let answer: any;
            if (this.isActiveChanged && this.isActiveFC.value == false) {
                let activeMessage = this.buildLabsMessage();
                this.dialogsService.confirm("Inactivating this user will remove them from the following lab(s):", activeMessage).subscribe(answer => {
                    if (answer) {
                        this.beingIsActive = true;
                        this.save();
                    }
                });

            } else {
                this.save();
            }
        }
    }
}

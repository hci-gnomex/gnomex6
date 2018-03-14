import {ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {AppUserListService} from "../services/app-user-list.service";
import {Subscription} from "rxjs/Subscription";
import {GridOptions, RowDataChangedEvent} from "ag-grid/main";
import { URLSearchParams } from "@angular/http";
import {LabListService} from "../services/lab-list.service";
import {
    AbstractControl, FormBuilder, FormControl, FormGroup,
    Validators
} from "@angular/forms";
import {GnomexService} from "../services/gnomex.service";
import {NewUserDialogComponent} from "./new-user-dialog.component";
import {ErrorStateMatcher, MatDialog, MatDialogRef} from "@angular/material";
import {PasswordUtilService} from "../services/password-util.service";
import {MatSnackBar} from "@angular/material";
import {DialogsService} from "../util/popup/dialogs.service";
import {DeleteUserDialogComponent} from "./delete-user-dialog.component";
import {GetLabService} from "../services/get-lab.service";
import {DictionaryService} from "../services/dictionary.service";
import {NewGroupDialogComponent} from "./new-group-dialog.component";
import {DeleteGroupDialogComponent} from "./delete-group-dialog.component";
import {VerifyUsersDialogComponent} from "./verify-users-dialog.component";
import {BillingAdminTabComponent} from "./billingAdminTab/billing-admin-tab.component";
import {MembershipTabComponent} from "./membershipTab/membership-tab.component";

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
    @ViewChild("billingAdminTab") billingAdminTab: BillingAdminTabComponent;
    @ViewChild("membershipTab") membershipTab: MembershipTabComponent;
    public readonly USER_TYPE_UNIVERSITY: string = "uu";
    public readonly USER_TYPE_EXTERNAL: string = "ex";
    private readonly DUMMY_UNID: string = "u0000000";
    private readonly DUMMY_USERNAME: string = "_";
    private readonly DUMMY_PASSWORD: string = "aaAA11$$";
    private readonly PASSWORD_MASKED: string = "XXXX";
    public  readonly EXACADEMIC = "EXACADEMIC";
    public  readonly EXCOMM = "EXCOMM";
    public  readonly INTERNAL = "INTERNAL";
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
    private idLab;
    private appUser: any;
    private idCoreFacility: string;
    private groupsData: any[] = [];
    private labs: any[] = [];
    private institutions: any[] = [];
    public collaboratingLabs: any[] = [];
    public managingLabs: any[] = [];
    public myManagingLabs: any[] = [];
    public myCoreFacilitiesIManage: any[] = [];
    public myCoreFacilities: any[] = [];
    public isUserTab: boolean = true;
    public isGroupsTab: boolean = false;
    public isGroupSubTab: boolean = true;
    public isBillingAdminSubTab: boolean = false;
    private userForm: FormGroup;
    private groupForm: FormGroup;
    private selectedUser: any = "";
    private selectedGroup: any = "";
    private isActive: boolean;
    public passwordFC: FormControl;
    public passwordConfirmFC: FormControl;
    public unidFC: FormControl;
    public usernameFC: FormControl;
    public usertypeFC: FormControl;
    public emailFC: FormControl;
    public groupEmailFC: FormControl;
    public permissionLevelFC: FormControl;
    public pricingFC: FormControl;
    public phoneFC: FormControl;
    public groupPhoneFC: FormControl;
    public isActiveFC: FormControl;
    public codeUserPermissionKind: string;
    public coreFacilitiesICanSubmitTo: any[];
    public coreFacilitiesIManage: any[];
    public searchText: string;
    public selectedTab: number = 0;
    public selectedGroupTab: number = 0;
    public showSpinner: boolean = false;
    private isActiveChanged: boolean = false;
    private beingIsActive: boolean = false;
    private createUserDialogRef: MatDialogRef<NewUserDialogComponent>;
    private deleteUserDialogRef: MatDialogRef<DeleteUserDialogComponent>;
    private createGroupDialogRef: MatDialogRef<NewGroupDialogComponent>;
    private deleteGroupDialogRef: MatDialogRef<DeleteGroupDialogComponent>;
    private verifyUsersDialogRef: MatDialogRef<VerifyUsersDialogComponent>;
    panelOpenState: boolean = false;
    public externalGroup: boolean = false;
    public groupFormDirty: boolean = false;
    public groupFormValid: boolean = false;
    constructor(public secAdvisor: CreateSecurityAdvisorService,
                public passwordUtilService: PasswordUtilService,
                private appUserListService: AppUserListService,
                private formBuilder: FormBuilder,
                private snackBar: MatSnackBar,
                private dialogsService: DialogsService,
                private getLabService: GetLabService,
                private labListService: LabListService,
                private dictionaryService: DictionaryService,
                private changeRef:ChangeDetectorRef,
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
                headerName: "",
                editable: false,
                field: "name",
            },
            {
                headerName: "",
                editable: false,
                cellRenderer: this.pricingCellRenderer,
                field: "pricing",
                width: 20
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

    pricingCellRenderer(params) {
        return "<img  src=" + params.data.icon + ">";
    }

    ngOnInit() {
        this.buildUsers();
        this.buildLabList();
        this.buildInstitutions();
    }

    ngAfterViewChecked() {
        let dirty = this.isGroupFormDirty();
        let valid = this.isGroupFormValid();
        let detectChanges: boolean = false;
        if (dirty != this.groupFormDirty) {
            this.groupFormDirty = dirty;
            detectChanges = true;
        }
        if (valid != this.groupFormValid) {
            this.groupFormValid = valid;
            detectChanges = true;
        }
        if (detectChanges) {
            this.changeRef.detectChanges();
        }

    }

    setPricing() {
        if (this.groupsData) {
            for (let lab of this.groupsData) {
                if (lab.isExternalPricing === 'Y') {
                    lab.pricing = "ext";
                    lab.icon = "../../assets/graduation_cap.png";
                } else if (lab.isExternalPricingCommercial === 'Y') {
                    lab.pricing = 'com';
                    lab.icon = "../../assets/building.png";
                } else {
                    lab.pricing = "int;"
                    lab.icon = "../../assets/empty.png";
                }
            }
        }
    }

    public buildUsers() {
        this.rowData = [];
        if (this.secAdvisor.isAdmin || this.secAdvisor.isSuperAdmin || this.secAdvisor.isBillingAdmin) {
            this.getAppUserListSubscription = this.appUserListService.getFullAppUserList().subscribe((response: any[]) => {
                this.createUserForm();
                this.userForm.markAsPristine();
                this.touchUserFields();
                this.rowData = response;
            });
        }
    }

    public buildGroups(params: URLSearchParams) {
        this.labListService.getLabListWithParams(params).subscribe((response: any[]) => {
            this.groupsData = response;
            this.setPricing();
        });

    }

    touchGroupFields() {
        for (let field in this.groupForm.controls) {
            const control = this.groupForm.get(field);
            if (control) {
                if (control.valid === false) {
                    control.markAsTouched();
                }
            }
        }
    }

    touchUserFields() {
        for (let field in this.userForm.controls) {
            const control = this.userForm.get(field);
            if (control) {
                if (control.valid === false) {
                    control.markAsTouched();
                }
            }
        }
    }

    public buildLabList() {
        var params: URLSearchParams = new URLSearchParams();
        params.set("idCoreFacility", this.idCoreFacility);
        params.set("idInstitution", "");
        params.set("isExternal", "");
        params.set("listKind", "UnboundedLabList");

        this.getGroupListSubscription = this.labListService.getLabListWithParams(params).subscribe((response: any[]) => {
            this.buildManagedLabList(response);
            if (this.secAdvisor.isSuperAdmin || this.secAdvisor.isAdmin || this.secAdvisor.isBillingAdmin) {
                this.groupsData = this.myManagingLabs;
            } else {
                this.groupsData = this.secAdvisor.groupsToManage;
                this.isGroupsTab = true;
                this.isUserTab = false;
            }
            this.createGroupForm();
            this.setPricing();
        });

    }

    buildManagedLabList(labs: any[]) {
        this.myCoreFacilitiesIManage = this.secAdvisor.coreFacilitiesICanManage;
        if (this.myCoreFacilitiesIManage.length > 0) {
            if (!this.secAdvisor.isSuperAdmin) {
                this.idCoreFacility = this.myCoreFacilitiesIManage[0].value;
            }
            let allObj = {facilityName: "All cores"};
            this.myCoreFacilitiesIManage.push(allObj);
            if (labs) {
                this.myManagingLabs = labs.filter((lab) => {
                    return lab.canManage === 'Y';
                })
            }
        }
    }

    public onNotifyGridRowDataChanged(): void {
        setTimeout(() => {
            if (this.userForm) {
                this.userForm.markAsPristine();
                this.touchUserFields();
            }
        });
    }

    public onSplitDragEnd(event) {
        this.gridOptions.api.sizeColumnsToFit();
        this.groupsGridOptions.api.sizeColumnsToFit();

    }

    public onGridSizeChanged(): void {
        setTimeout(() => {
            this.gridOptions.api.sizeColumnsToFit();
        });
    }

    public onManGridSizeChanged(): void {
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

    setGroupValues() {
        for (let core of this.myCoreFacilities) {
            this.groupForm.controls[core.display].patchValue(core.isSelected, {onlySelf: true, emitEvent: true});

        }
        this.groupForm
            .patchValue({
                firstName: this.selectedGroup.firstName,
                lastName: this.selectedGroup.lastName,
                pricing: this.selectedGroup.pricing,
                contactPhone: this.selectedGroup.contactPhone,
                contactEmail: this.selectedGroup.contactEmail,
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
        this.phoneFC = new FormControl("");

        this.userForm = this.formBuilder.group({
            lastName: ['', [
                Validators.required
            ]],
            firstName: ['', [
                Validators.required
            ]],
            email: this.emailFC,
            phone: this.phoneFC,
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
        });
        this.passwordFC.setParent(this.userForm);
        this.passwordConfirmFC.setParent(this.userForm);
    }

    createGroupForm() {
        this.groupEmailFC = new FormControl("", [Validators.required, Validators.pattern("^((\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*)\\s*[,]{0,1}\\s*)+$")]);
        this.pricingFC = new FormControl("", Validators.required);
        this.groupPhoneFC = new FormControl("");

        this.groupForm = this.formBuilder.group({
            lastName: '',
            firstName: '',
            contactEmail: this.groupEmailFC,
            contactPhone: this.groupPhoneFC,
            pricing: this.pricingFC
        }, { validator: this.atLeastOneNameRequired});
    }

    atLeastOneNameRequired(group : FormGroup) {
        if (group) {
            if(group.controls['lastName'].value || group.controls['firstName'].value) {

                group.controls['lastName'].setErrors(null);
                group.controls['firstName'].setErrors(null);
            } else {
                group.controls['lastName'].setErrors({'incorrect': true});
                group.controls['firstName'].setErrors({'incorrect': true});
            }
        }
    }

    search() {

        this.gridOptions.api.setQuickFilter(this.searchText);
    }

    searchGroups(event) {

        this.groupsGridOptions.api.setQuickFilter(this.searchText);
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
            this.touchUserFields();
            if (this.secAdvisor.isAdmin && !this.secAdvisor.isSuperAdmin && this.selectedUser.codeUserPermissionKind === 'SUPER') {
                this.userForm.disable();
            }
        });

    }

    onGroupsSelectionChanged() {
        var params: URLSearchParams = new URLSearchParams();
        var selectedRows = this.groupsGridOptions.api.getSelectedRows();
        this.idLab = selectedRows[0].idLab;
        this.myCoreFacilities = [];
        params.set("idLab", this.idLab);
        this.getLabService.getLab(params).subscribe((response: any) => {
            this.selectedGroup = response.Lab;
            this.myCoreFacilities = this.buildGroupCoreControls();
            this.setLabPricing(this.selectedGroup);
            this.setGroupValues();
            this.changeRef.detectChanges();


        })
        this.groupForm.markAsPristine();
        this.touchGroupFields();
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

    private setLabPricing(lab) {
        if (lab.isExternalPricing === 'Y') {
            lab.pricing = this.EXACADEMIC;
        } else if (lab.isExternalPricingCommercial === 'Y') {
            lab.pricing = this.EXCOMM;
        } else {
            lab.pricing = this.INTERNAL;
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

    onGroupsTabChange(event) {
        switch(event.tab.textLabel) {
            case "Group": {
                this.isGroupSubTab = true;
                this.isBillingAdminSubTab = false;
                break;
            }
            case "Billing Admin": {
                this.isBillingAdminSubTab = true;
                this.isGroupSubTab = false;
                break;
            }
        }
    }

    selectSubmissionCheckbox(getAppUser: any) {
        // Have to build checkboxes on the fly
        this.coreFacilitiesICanSubmitTo = [];
        this.coreFacilitiesIManage = [];
        if (this.codeUserPermissionKind === 'LAB' || this.codeUserPermissionKind === 'BILLING' || this.codeUserPermissionKind == 'ADMIN') {
            if (!this.secAdvisor.isArray(getAppUser.coreFacilitiesICanSubmitTo)) {
                getAppUser.coreFacilitiesICanSubmitTo = [getAppUser.coreFacilitiesICanSubmitTo.coreFacility];
            }
            this.coreFacilitiesICanSubmitTo = getAppUser.coreFacilitiesICanSubmitTo.filter((core) => {
                return core.allowed === 'Y';
            })
        }
        if (this.secAdvisor.isSuperAdmin) {
            this.coreFacilitiesIManage = getAppUser.managingCoreFacilities;
            for (let core of this.coreFacilitiesIManage) {
                if (core.selected ==='Y') {
                    core.isSelected = true;
                } else {
                    core.isSelected = false;
                }
                let control: FormControl;
                core.mDisplay = core.display + 'm';
                control = new FormControl({value: core.display + 'm', disabled: false});
                this.userForm.addControl(core.display + 'm', control);
            }

        } else if (this.codeUserPermissionKind === 'BILLING' || this.codeUserPermissionKind === 'ADMIN') {
            this.coreFacilitiesIManage = getAppUser.managingCoreFacilities;
            for (let core of this.coreFacilitiesIManage) {
                if (core.selected ==='Y') {
                    core.isSelected = true;
                } else {
                    core.isSelected = false;
                }
                let control: FormControl;
                core.mDisplay = core.display + 'm';
                if (core.value === this.secAdvisor.coreFacilitiesICanManage[0].value) {
                    control = new FormControl({value: core.display + 'm', disabled: false});
                } else {
                    control = new FormControl({value: core.display + 'm', disabled: true});
                }
                this.userForm.addControl(core.display + 'm', control);
            }

        }

        for (let core of this.coreFacilitiesICanSubmitTo) {
            let control: FormControl = new FormControl(core.display);
            this.userForm.addControl(core.display, control);
            if (core.selected ==='Y') {
                core.isSelected = true;
            } else {
                core.isSelected = false;
            }
        }
    }

    buildGroupCoreControls(): any[] {
        let myCoreFacilities: any[] = [];

        if (!this.secAdvisor.isArray(this.selectedGroup.coreFacilities)) {
            this.selectedGroup.coreFacilities = [this.selectedGroup.coreFacilities.CoreFacility];
        }

        let myCores = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.CoreFacility");
        for (let myCore of myCores) {
            let control: FormControl = new FormControl(myCore.display);
            this.groupForm.addControl(myCore.display, control);
            if (this.secAdvisor.isSuperAdmin) {
                control.enable();
            } else {
                if (myCore.idCoreFacility === this.idCoreFacility) {
                    control.enable();
                } else {
                    control.disable();
                }
            }
            myCore.isSelected = false;
            myCoreFacilities.push(myCore);
        }

        for (let core of myCoreFacilities) {
            for (let selectedCore of this.selectedGroup.coreFacilities) {
                if (selectedCore.value === core.value) {
                    core.isSelected = true;
                    break;
                }
            }
        }
        return myCoreFacilities;
    }

    newUser() {
        this.createUserDialogRef = this.dialog.open(NewUserDialogComponent, {
            height: '20em',
            width: '24em',
        });
        this.createUserDialogRef.afterClosed()
            .subscribe(result => {
                if (this.createUserDialogRef.componentInstance.rebuildUsers) {
                    this.buildUsers();
                }
            })

    }

    deleteUser() {
        this.deleteUserDialogRef = this.dialog.open(DeleteUserDialogComponent, {
            height: '11em',
            width: '24em',
            data: {
                idAppUser: this.idAppUser,
                userName: this.selectedUser.displayName
            }

        });
        this.deleteUserDialogRef.afterClosed()
            .subscribe(result => {
                if (this.deleteUserDialogRef.componentInstance.rebuildUsers) {
                    this.buildUsers();
                }
            })

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
        if (this.usertypeFC.value === this.USER_TYPE_UNIVERSITY) {
            params.set("uNID", this.userForm.controls['uNid'].value);
        } else if (this.usertypeFC.value === this.USER_TYPE_EXTERNAL) {
            params.set("userNameExternal", this.userForm.controls['userName'].value);
            params.set("passwordExternal", this.userForm.controls['password'].value === this.DUMMY_PASSWORD ? this.PASSWORD_MASKED : this.userForm.controls['password'].value);
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
        this.appUserListService.saveAppUser(params).subscribe((response: Response) => {
            if (response.status === 200) {
                let responseJSON: any = response.json();
                if (responseJSON.result && responseJSON.result === "SUCCESS") {
                    this.userForm.markAsPristine();
                    this.touchUserFields();
                    this.snackBar.open("Changes Saved", "User", {
                        duration: 3000
                    });
                    this.buildUsers();
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
            let answer: string;
            if (this.isActiveChanged && this.isActiveFC.value == false) {
                if ( this.isMemberOfLab()) {
                    let activeMessage = this.buildLabsMessage();
                    this.dialogsService.confirm("Inactivating this user will remove them from the following lab(s):", activeMessage).subscribe(answer => {
                        if (answer) {
                            this.beingIsActive = true;
                            this.save();
                        }
                    });
                } else {
                    this.dialogsService.confirm("This will inactivate the user", " ").subscribe(answer => {
                        if (answer) {
                            this.beingIsActive = true;
                            this.save();
                        }
                    });

                }

            } else {
                this.save();
            }
        }
    }

    isMemberOfLab(): boolean {
       if (this.collaboratingLabs.length > 0 ||
            this.managingLabs.length > 0 ||
            this.labs.length > 0) {
           return true;
       } else {
           return false;
       }
    }

    saveGroup() {
        let params: URLSearchParams = new URLSearchParams();
        let cores: any[] = [];
        // For now put the selectedGroup accounts in the savelab. Later get them off the billingAccountsForm
        let accountsXMLString: string;
        if (!this.secAdvisor.isArray(this.selectedGroup.billingAccounts)) {
            this.selectedGroup.billingAccounts = [this.selectedGroup.billingAccounts.BillingAccount]
        }
        let stringifiedAccounts: string = JSON.stringify(this.selectedGroup.billingAccounts.slice(0,1));
        params.set("accountsXMLString", stringifiedAccounts);
        if (this.groupForm) {
            for (let field in this.groupForm.controls) {
                const control = this.groupForm.get(field);
                if (control) {
                    if (field === "pricing") {
                        switch (control.value) {
                            case this.EXACADEMIC: {
                                params.set("isExternalPricing", 'Y');
                                params.set("isExternalPricingCommercial", 'N');
                                break;
                            }
                            case this.EXCOMM: {
                                params.set("isExternalPricing", 'Y');
                                params.set("isExternalPricingCommercial", 'Y');
                                break;
                            }
                            case this.EXACADEMIC: {
                                params.set("isExternalPricing", 'N');
                                params.set("isExternalPricingCommercial", 'N');
                                break;
                            }
                        }
                    } else if (this.myCoreFacilities.filter((core => core.facilityName === field)).length > 0) {
                        if (control.value === true) {
                            let cf: any = this.myCoreFacilities.filter((core => core.facilityName === field));
                            let coreObj = {
                                "idCoreFacility": cf[0].idCoreFacility,
                                "facilityName": cf[0].facilityName
                            };
                            cores.push(coreObj);
                        }

                    } else {
                        params.set(field, control.value);
                    }
                }
            }
            let stringifiedSF = JSON.stringify(cores);
            params.set("coreFacilitiesXMLString", stringifiedSF);
            params.set("excludeUsage", this.selectedGroup.excludeUsage);
            params.set("lab", this.selectedGroup.lab);
            params.set("version", this.selectedGroup.version);
        }
        if (this.billingAdminTab) {
            for (let field in this.billingAdminTab.billingForm.controls) {
                const control = this.billingAdminTab.billingForm.get(field);
                if (control) {
                    params.set(field, control.value);
                }
            }
        }
        if (this.membershipTab) {
            let stringifiedMembers = JSON.stringify(this.membershipTab.membersDataSource.data);
            params.set("membersXMLString", stringifiedMembers);
            let stringifiedColls = JSON.stringify(this.membershipTab.collaboratorsDataSource.data);
            params.set("collaboratorsXMLString", stringifiedColls);
            let stringifiedManagers = JSON.stringify(this.membershipTab.managersDataSource.data);
            params.set("managersXMLString", stringifiedManagers);

        }
        this.labListService.saveLab(params).subscribe((response: Response) => {
            if (response.status === 200) {
                let responseJSON: any = response.json();
                if (responseJSON.result && responseJSON.result === "SUCCESS") {
                    this.groupForm.markAsPristine();
                    this.touchGroupFields();
                    this.snackBar.open("Changes Saved", "Lab", {
                        duration: 2000
                    });
                    this.buildLabList();
                }
            }
            this.showSpinner = false;
        });
    }

    searchCoreFacility(event) {
        var params: URLSearchParams = new URLSearchParams();
        params.set("idCoreFacility", event.value);
        params.set("idInstitution", "");
        params.set("isExternal", "");
        params.set("listKind", "UnboundedLabList");


        this.buildGroups(params);
    }

    onExternalGroupChange(event) {
        var params: URLSearchParams = new URLSearchParams();
        params.set("idCoreFacility", "");
        params.set("idInstitution", "");
        if (event.checked) {
            params.set("isExternal", 'Y');
        } else {
            params.set("isExternal", 'N');
        }
        params.set("listKind", "UnboundedLabList");


        this.buildGroups(params);

    }

    buildInstitutions() {
        this.institutions = this.dictionaryService.getEntries(DictionaryService.INSTITUTION);

    }

    searchInstitution(event) {
        var params: URLSearchParams = new URLSearchParams();
        params.set("idCoreFacility", "");
        params.set("idInstitution", event.value);
        params.set("isExternal", "");
        params.set("listKind", "UnboundedLabList");


        this.buildGroups(params);
    }

    newGroup() {
        this.createGroupDialogRef = this.dialog.open(NewGroupDialogComponent, {
            height: '35em',
            width: '20em',
        });
        this.createGroupDialogRef.afterClosed()
            .subscribe(result => {
                if (this.createGroupDialogRef.componentInstance.rebuildGroups) {
                    this.buildLabList();
                }
            })

    }

    deleteGroup() {
        this.deleteGroupDialogRef = this.dialog.open(DeleteGroupDialogComponent, {
            height: '10em',
            width: '20em',
            data: {
                idLab: this.idLab,
                labName: this.selectedGroup.name
            }

        });
        this.deleteGroupDialogRef.afterClosed()
            .subscribe(result => {
                if (this.deleteGroupDialogRef.componentInstance.rebuildGroups) {
                    this.buildLabList();
                }
            })

    }

    verify(mode: string) {
        let theLabId = (mode === 'lab' ? this.idLab : "");
        this.verifyUsersDialogRef = this.dialog.open(VerifyUsersDialogComponent, {
            height: '16em',
            width: '20em',
            data: {
                idLab: theLabId,
                labName: this.selectedGroup.name
            }

        });
        this.verifyUsersDialogRef.afterClosed()
            .subscribe(result => {
            })

    }

    isGroupFormDirty(): boolean {
        if (this.billingAdminTab && this.billingAdminTab.billingForm.dirty) {
            return true;
        }
        if (this.membershipTab && this.membershipTab.membershipForm.dirty) {
            return true;
        }
        if (this.groupForm && this.groupForm.dirty) {
            return true;
        }
        return false;
    }

    isGroupFormValid() {
        if ((this.billingAdminTab && this.billingAdminTab.billingForm.valid) &&
            (this.membershipTab && this.membershipTab.membershipForm.valid) &&
            this.groupForm.valid) {
            return true;
        } else {
            return false;
        }
    }
}

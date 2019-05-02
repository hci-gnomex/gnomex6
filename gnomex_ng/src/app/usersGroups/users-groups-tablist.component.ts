import {AfterViewChecked, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {URLSearchParams} from "@angular/http";
import {MatDialog, MatDialogConfig, MatDialogRef, MatSnackBar, MatSnackBarConfig} from "@angular/material";

import {GridOptions} from "ag-grid-community/main";
import {GridApi, GridReadyEvent, ColDef, RowSelectedEvent} from "ag-grid-community";

import {Subscription} from "rxjs";

import {BillingAdminTabComponent} from "./billingAdminTab/billing-admin-tab.component";
import {DeleteGroupDialogComponent} from "./delete-group-dialog.component";
import {DeleteUserDialogComponent} from "./delete-user-dialog.component";
import {MembershipTabComponent} from "./membershipTab/membership-tab.component";
import {NewGroupDialogComponent} from "./new-group-dialog.component";
import {NewUserDialogComponent} from "./new-user-dialog.component";
import {VerifyUsersDialogComponent} from "./verify-users-dialog.component";

import {AppUserListService} from "../services/app-user-list.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {DictionaryService} from "../services/dictionary.service";
import {GetLabService} from "../services/get-lab.service";
import {LabListService} from "../services/lab-list.service";
import {PasswordUtilService} from "../services/password-util.service";
import {BillingAccountTabComponent} from "./billingAccountTab/billing-account-tab.component";
import {UserPreferencesService} from "../services/user-preferences.service";
import {HttpParams} from "@angular/common/http";
import {PropertyService} from "../services/property.service";
import {UtilService} from "../services/util.service";
import {ConstantsService} from "../services/constants.service";
import {ConfigAnnotationDialogComponent} from "../util/config-annotation-dialog.component";
import {EditInstitutionsComponent} from "../util/edit-institutions.component";

/**
 * @title Basic tabs
 */
@Component({
    selector: 'users-groups-tablist',
    templateUrl: './users-groups-tablist.component.html',
    styles: [`
        
        /deep/ .mat-tab-body-wrapper {
            flex-grow: 1 !important;
        }
        
        div.formRow {
            display: flex;
            flex-direction: row;
            margin: 0.5% 0;
            width: 80%;
        }
        mat-form-field.formField {
            width: 30%;
            min-width: 15em;
            margin: 0 0.5%;
        }
        ::ng-deep.mat-tab-label, ::ng-deep.mat-tab-label-active{
            min-width: 10em;
            padding: 3px;
            margin: 3px;
        }

        div.institution-div {
            height: 18em;
        }
        
        .color-blue {
            color: blue;
        }

        
        label {
            font-style: italic;
            color: #1601db;
        }
        
        .height-auto { height: auto; }
        
        .reserve-height {
            height:     fit-content;
            min-height: fit-content; 
        }
        
        .small-width { width: 12em; }

        .horizontal-spacer { 
            height: 100%;
            width: 0.3em;
        }
        
        .foreground { background-color: white;   }
        .background { background-color: #EEEEEE; }

        .border-padding {
            padding:       0.3em;
            border-radius: 0.3em;
            border: 1px solid darkgrey;
        }
        
        .right-align { text-align: right; }
        
        .small-font { font-size: small; }
        
        .margin-left { margin-left: 0.3em; }
        
        .large-margin-left  { margin-left:  2em; }
        .large-margin-right { margin-right: 2em; }
        
        .padded { padding: 0.3em; }
        
        .padded-right  { padding-right:  0.3em; }
        .padded-bottom { padding-bottom: 0.3em; }
        
        .padded-left-right {
            padding-left:   0.3em;
            padding-right:  0.3em;
        }
        
        .padded-left-right-bottom {
            padding-left:   0.3em;
            padding-right:  0.3em;
            padding-bottom: 0.3em;
        }
        
        .large-padding-right { padding-right: 2em; }

    `]
})
export class UsersGroupsTablistComponent implements AfterViewChecked, OnInit{

    @ViewChild("billingAccountTab") billingAccountTab: BillingAccountTabComponent;
    @ViewChild("billingAdminTab") billingAdminTab: BillingAdminTabComponent;
    @ViewChild("membershipTab") membershipTab: MembershipTabComponent;

    private readonly DUMMY_UNID: string = "u0000000";
    private readonly DUMMY_USERNAME: string = "_";
    private readonly DUMMY_PASSWORD: string = "aaAA11$$";
    private readonly PASSWORD_MASKED: string = "XXXX";

    public readonly USER_TYPE_UNIVERSITY: string = "uu";
    public readonly USER_TYPE_EXTERNAL: string = "ex";
    public readonly EXACADEMIC = "EXACADEMIC";
    public readonly EXCOMM = "EXCOMM";
    public readonly INTERNAL = "INTERNAL";

    public showInstitutions: boolean = false;
    public institutionGridColDefs: ColDef[];
    public institutionGridApi: GridApi;
    public institutions: any[] = [];
    public labInstitutions: any[] = [];
    public institutionToAddControl: FormControl;
    public institutionToRemove: any = null;
    private institutionsChanged: boolean = false;

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
    public labs: any[] = [];
    public collaboratingLabs: any[] = [];
    public managingLabs: any[] = [];
    public myManagingLabs: any[] = [];
    public myCoreFacilitiesIManage: any[] = [];
    public myCoreFacilities: any[] = [];
    public isUserTab: boolean = true;
    public isGroupsTab: boolean = false;
    public isGroupSubTab: boolean = true;
    public groupSubTabName: string = "";
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
    private userLabel: string;
    private groupLabel: string;

    constructor(public secAdvisor: CreateSecurityAdvisorService,
                public passwordUtilService: PasswordUtilService,
                public constantsService: ConstantsService,
                private appUserListService: AppUserListService,
                private formBuilder: FormBuilder,
                private snackBar: MatSnackBar,
                private dialogsService: DialogsService,
                private getLabService: GetLabService,
                private labListService: LabListService,
                private dictionaryService: DictionaryService,
                private changeRef:ChangeDetectorRef,
                public prefService: UserPreferencesService,
                private propertyService: PropertyService,
                private dialog: MatDialog
                ) {
        this.columnDefs = [
            {
                headerName: "",
                editable: false,
                field: this.prefService.userDisplayField,
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
                field: this.prefService.labDisplayField,
                width: 200
            },
            {
                headerName: "",
                editable: false,
                cellRenderer: this.pricingCellRenderer,
                field: "pricing",
                width: 20,
                maxWidth:20,
                minWidth:20
            }
        ];
        this.labColumnDefs = [
            {
                headerName: "Labs",
                editable: false,
                field: this.prefService.labDisplayField,
            },
        ];
        this.collColumnDefs = [
            {
                headerName: "Collaborating Labs",
                editable: false,
                field: this.prefService.labDisplayField,
            }
        ];
        this.manColumnDefs = [
            {
                headerName: "Managing Labs",
                editable: false,
                field: this.prefService.labDisplayField,
            }
        ];
        this.rowSelection = "single";
    }

    pricingCellRenderer(params) {
        return "<img  src=" + params.data.icon + ">";
    }

    ngOnInit() {
        this.showInstitutions = !this.propertyService.getPropertyAsBoolean(PropertyService.PROPERTY_HIDE_INSTITUTIONS);
        if (this.showInstitutions) {
            this.institutionGridColDefs = [
                {
                    headerName: "Name",
                    editable: false,
                    field: "display"
                }
            ];
            this.institutionToAddControl = new FormControl("");
        }
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
                    lab.pricing = "int";
                    lab.icon = "../../assets/empty.png";
                }
            }
        }
    }

    public buildUsers() {
        this.rowData = [];
        if (this.secAdvisor.isAdmin || this.secAdvisor.isSuperAdmin || this.secAdvisor.isBillingAdmin) {
            this.getAppUserListSubscription = this.appUserListService.getFullAppUserList().subscribe((response: any[]) => {
                this.userLabel = response.length + " users";
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
            this.groupLabel = response.length + " groups";
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
            }
            this.isGroupsTab = true;
            this.isUserTab = false;

            this.groupLabel = this.groupsData.length + " lab groups";
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

    public onGridSizeChanged(event: any): void {
        if (event && event.api) {
            event.api.sizeColumnsToFit();
        }
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
    onSelectionChanged(event?: any) {
        let params: URLSearchParams = new URLSearchParams();
        let selectedRows = this.gridOptions.api.getSelectedRows();
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

    onGroupsSelectionChanged(event?: any) {
        this.dialogsService.startDefaultSpinnerDialog();

        let params: URLSearchParams = new URLSearchParams();
        let selectedRows = this.groupsGridOptions.api.getSelectedRows();
        this.idLab = selectedRows[0].idLab;
        this.myCoreFacilities = [];
        params.set("idLab", this.idLab);

        this.getLabService.getLab(params).subscribe((response: any) => {
            this.selectedGroup = response.Lab;
            if (this.showInstitutions) {
                this.resetInstitutionControls();
                this.labInstitutions = UtilService.getJsonArray(this.selectedGroup.institutions, this.selectedGroup.institutions.Institution);
                if (this.institutionGridApi) {
                    this.institutionGridApi.setRowData(this.labInstitutions);
                }
            }
            this.myCoreFacilities = this.buildGroupCoreControls();
            this.setLabPricing(this.selectedGroup);
            this.setGroupValues();
            this.changeRef.detectChanges();
            this.dialogsService.stopAllSpinnerDialogs();
        });

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

            setTimeout(() => {
                if (this.groupsGridOptions && this.groupsGridOptions.api) {
                    this.groupsGridOptions.api.sizeColumnsToFit();
                }
            });
        } else {
            this.isUserTab = true;
            this.isGroupsTab = false;

            setTimeout(() => {
                if (this.gridOptions && this.gridOptions.api) {
                    this.gridOptions.api.sizeColumnsToFit();
                }
            });
        }
    }

    onGroupsTabChange(event) {
        this.groupSubTabName = event.tab.textLabel;
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
            this.coreFacilitiesIManage = Array.isArray(getAppUser.managingCoreFacilities) ? getAppUser.managingCoreFacilities : [getAppUser.managingCoreFacilities.coreFacility];
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
            this.coreFacilitiesIManage = Array.isArray(getAppUser.managingCoreFacilities) ? getAppUser.managingCoreFacilities : [getAppUser.managingCoreFacilities.coreFacility];
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
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.height = '20em';
        configuration.width  = '24em';

        this.createUserDialogRef = this.dialog.open(NewUserDialogComponent, configuration);
        this.createUserDialogRef.afterClosed()
            .subscribe(result => {
                if (this.createUserDialogRef.componentInstance.rebuildUsers) {
                    this.buildUsers();
                }
            })

    }

    deleteUser() {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.height = '11em';
        configuration.width  = '24em';

        configuration.data = {
            idAppUser: this.idAppUser,
            userName: this.selectedUser[this.prefService.userDisplayField]
        };

        this.deleteUserDialogRef = this.dialog.open(DeleteUserDialogComponent, configuration);
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
        let filter = api.getFilterInstance(this.prefService.userDisplayField);
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
            message = message.concat(lab[this.prefService.labDisplayField] + " as a member");
            message = message.concat(", ");
        }
        for (let lab of this.collaboratingLabs) {
            message = message.concat(lab[this.prefService.labDisplayField] + " as a collaborator");
            message = message.concat(", ");
        }
        for (let lab of this.managingLabs) {
            message = message.concat(lab[this.prefService.labDisplayField]) + " as a manager";
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

                    let config: MatSnackBarConfig = new MatSnackBarConfig();
                    config.duration = 3000;

                    this.snackBar.open("Changes Saved", "User", config);
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

    saveLab(): void {

        let warningMessages: string[] = [];

        if (!this.selectedGroup) {
            return;
        }

        if (this.billingAccountTab && this.billingAccountTab.tabFormGroup && this.billingAccountTab.tabFormGroup.invalid) {
            warningMessages.push("Billing account errors detected!");
        }

        let chartfieldAccounts: any[] = [];
        let poAccounts:         any[] = [];
        let creditCardAccounts: any[] = [];

        if (this.selectedGroup) {
            if (this.selectedGroup.internalBillingAccounts) {
                chartfieldAccounts = Array.isArray(this.selectedGroup.internalBillingAccounts)   ? this.selectedGroup.internalBillingAccounts   : [this.selectedGroup.internalBillingAccounts.BillingAccount];
            }
            if (this.selectedGroup.pOBillingAccounts) {
                poAccounts         = Array.isArray(this.selectedGroup.pOBillingAccounts)         ? this.selectedGroup.pOBillingAccounts         : [this.selectedGroup.pOBillingAccounts.BillingAccount];
            }
            if (this.selectedGroup.creditCardBillingAccounts) {
                creditCardAccounts = Array.isArray(this.selectedGroup.creditCardBillingAccounts) ? this.selectedGroup.creditCardBillingAccounts : [this.selectedGroup.creditCardBillingAccounts.BillingAccount];
            }
        }

        for (let account of chartfieldAccounts) {
            if (!this.arePoFieldsBlank(account)) {
                warningMessages.push('Will clear PO account fields from new chartfield account "' + account.accountName + '"');
            } if (!this.areCreditCardFieldsBlank(account)) {
                warningMessages.push('Will clear credit card account fields from new chartfield account "' + account.accountName + '"');
            }
        }
        for (let account of poAccounts) {
            if (!this.areChartfieldFieldsBlank(account)) {
                warningMessages.push('Will clear chartfield account fields from new PO account "' + account.accountName + '"');
            } if (!this.areCreditCardFieldsBlank(account)) {
                warningMessages.push('Will clear credit card account fields from new PO account "' + account.accountName + '"');
            }
        }
        for (let account of creditCardAccounts) {
            if (!this.arePoFieldsBlank(account)) {
                warningMessages.push('Will clear PO account fields from new credit card account "' + account.accountName + '"');
            } if (!this.areChartfieldFieldsBlank(account)) {
                warningMessages.push('Will clear chartfield account fields from new credit card account "' + account.accountName + '"');
            }
        }

        if (warningMessages.length > 0) {
            warningMessages.push(' ');
            warningMessages.push('Continue with save anyway?');

            this.dialogsService.yesNoDialog(warningMessages, this, "saveGroup");
        } else {
            this.saveGroup();
        }
    }

    testFunction(): void {
        console.log('Save this lab!');
    }

    areChartfieldFieldsBlank(billingAccount: any): boolean {
        return !!billingAccount
            && !billingAccount.accountNumberBus
            && !billingAccount.accountNumberOrg
            && !billingAccount.accountNumberFund
            && !billingAccount.accountNumberActivity
            && !billingAccount.accountNumberProject
            && !billingAccount.accountNumberAccount
            && !billingAccount.accountNumberAu
            && !billingAccount.accountNumberYear
            && !billingAccount.custom1
            && !billingAccount.custom2
            && !billingAccount.custom3;
    }
    arePoFieldsBlank(billingAccount: any): boolean {
        return true;
    }
    areCreditCardFieldsBlank(billingAccount: any): boolean {
        return true;
    }

    clearChartfieldFields(billingAccount: any): void {
        if (!billingAccount) {
            return;
        }

        billingAccount.accountNumberBus      = '';
        billingAccount.accountNumberOrg      = '';
        billingAccount.accountNumberFund     = '';
        billingAccount.accountNumberActivity = '';
        billingAccount.accountNumberProject  = '';
        billingAccount.accountNumberAccount  = '';
        billingAccount.accountNumberAu       = '';
        billingAccount.accountNumberYear     = '';
        billingAccount.custom1               = '';
        billingAccount.custom2               = '';
        billingAccount.custom3               = '';
    }
    clearPoFields(billingAccount: any): void {
        if (!billingAccount) {
            return;
        }

        // billingAccount.accountNumberBus      = '';
        // billingAccount.accountNumberOrg      = '';
        // billingAccount.accountNumberFund     = '';
        // billingAccount.accountNumberActivity = '';
        // billingAccount.accountNumberProject  = '';
        // billingAccount.accountNumberAccount  = '';
        // billingAccount.accountNumberAu       = '';
        // billingAccount.accountNumberYear     = '';
        // billingAccount.custom1               = '';
        // billingAccount.custom2               = '';
        // billingAccount.custom3               = '';
    }
    clearCreditCardFields(billingAccount: any): void {
        if (!billingAccount) {
            return;
        }

        // billingAccount.accountNumberBus      = '';
        // billingAccount.accountNumberOrg      = '';
        // billingAccount.accountNumberFund     = '';
        // billingAccount.accountNumberActivity = '';
        // billingAccount.accountNumberProject  = '';
        // billingAccount.accountNumberAccount  = '';
        // billingAccount.accountNumberAu       = '';
        // billingAccount.accountNumberYear     = '';
        // billingAccount.custom1               = '';
        // billingAccount.custom2               = '';
        // billingAccount.custom3               = '';
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
        let params: HttpParams = new HttpParams();
        let cores: any[] = [];

        let accountsJSONString: string;

        let chartfieldAccounts: any[] = [];
        let poAccounts:         any[] = [];
        let creditCardAccounts: any[] = [];

        if (this.selectedGroup) {
            if (this.selectedGroup.internalBillingAccounts) {
                chartfieldAccounts = Array.isArray(this.selectedGroup.internalBillingAccounts)   ? this.selectedGroup.internalBillingAccounts   : [this.selectedGroup.internalBillingAccounts.BillingAccount];
            }
            if (this.selectedGroup.pOBillingAccounts) {
                poAccounts         = Array.isArray(this.selectedGroup.pOBillingAccounts)         ? this.selectedGroup.pOBillingAccounts         : [this.selectedGroup.pOBillingAccounts.BillingAccount];
            }
            if (this.selectedGroup.creditCardBillingAccounts) {
                creditCardAccounts = Array.isArray(this.selectedGroup.creditCardBillingAccounts) ? this.selectedGroup.creditCardBillingAccounts : [this.selectedGroup.creditCardBillingAccounts.BillingAccount];
            }
        }

        let billingAccounts: any[] = [];

        for (let account of chartfieldAccounts) {
            this.clearPoFields(account);
            this.clearCreditCardFields(account);

            billingAccounts.push(account);
        }
        for (let account of poAccounts) {
            this.clearChartfieldFields(account);
            this.clearCreditCardFields(account);

            billingAccounts.push(account);
        }
        for (let account of creditCardAccounts) {
            this.clearChartfieldFields(account);
            this.clearPoFields(account);

            billingAccounts.push(account);
        }

        let stringifiedAccounts: string = JSON.stringify(billingAccounts);
        params = params.set("accountsJSONString", stringifiedAccounts);


        if (this.groupForm) {
            for (let field in this.groupForm.controls) {
                const control = this.groupForm.get(field);
                if (control) {
                    if (field === "pricing") {
                        switch (control.value) {
                            case this.EXACADEMIC: {
                                params = params.set("isExternalPricing", 'Y');
                                params = params.set("isExternalPricingCommercial", 'N');
                                break;
                            }
                            case this.EXCOMM: {
                                params = params.set("isExternalPricing", 'Y');
                                params = params.set("isExternalPricingCommercial", 'Y');
                                break;
                            }
                            case this.INTERNAL: {
                                params = params.set("isExternalPricing", 'N');
                                params = params.set("isExternalPricingCommercial", 'N');
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
                        params = params.set(field, control.value);
                    }
                }
            }
            let stringifiedSF = JSON.stringify(cores);
            params = params.set("coreFacilitiesJSONString", stringifiedSF);
            params = params.set("excludeUsage", this.selectedGroup.excludeUsage);
            params = params.set("lab", this.selectedGroup.lab);
            params = params.set("idLab", this.selectedGroup.idLab);
            params = params.set("version", this.selectedGroup.version);
        }
        if (this.billingAdminTab) {
            for (let field in this.billingAdminTab.billingForm.controls) {
                const control = this.billingAdminTab.billingForm.get(field);
                if (control) {
                    params = params.set(field, control.value);
                }
            }
        }
        if (this.membershipTab) {
            // let stringifiedMembers = JSON.stringify(this.addAppUser(this.membershipTab.membersDataSource.data));
            let stringifiedMembers = JSON.stringify(this.membershipTab.membersDataSource.data);
            params = params.set("membersJSONString", stringifiedMembers);
            let stringifiedColls = JSON.stringify(this.addAppUser(this.membershipTab.collaboratorsDataSource.data));
            params = params.set("collaboratorsJSONString", stringifiedColls);
            let stringifiedManagers = JSON.stringify(this.addAppUser(this.membershipTab.managersDataSource.data));
            params = params.set("managersJSONString", stringifiedManagers);

        }

        if (this.showInstitutions) {
            params = params.set("institutionsJSONString", JSON.stringify(this.labInstitutions));
        }

        params = params.set("noJSONToXMLConversionNeeded", "Y");

        this.labListService.saveLab(params).subscribe((responseJSON: any) => {
            if (responseJSON.result && responseJSON.result === "SUCCESS") {
                this.groupForm.markAsPristine();
                if (this.showInstitutions) {
                    this.resetInstitutionControls();
                }
                this.touchGroupFields();

                let config: MatSnackBarConfig = new MatSnackBarConfig();
                config.duration = 2000;

                this.snackBar.open("Changes Saved", "Lab", config);
                this.buildLabList();
            }
            this.showSpinner = false;
        });
    }

    addAppUser(users: any[]): any[] {
        let appUsers: any[] = [];

        for (let user of users) {
            let appUser: any;

            appUser = {"AppUser": user};
            appUsers.push(appUser);
        }
        return appUsers;
    }

    searchCoreFacility(event) {
        let params: URLSearchParams = new URLSearchParams();
        params.set("idCoreFacility", event.value);
        params.set("idInstitution", "");
        params.set("isExternal", "");
        params.set("listKind", "UnboundedLabList");


        this.buildGroups(params);
    }

    onExternalGroupChange(event) {
        let params: URLSearchParams = new URLSearchParams();
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
        this.institutions = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.INSTITUTION).sort(this.prefService.createDisplaySortFunction("display"));
    }

    public onInstitutionGridReady(event: GridReadyEvent): void {
        this.institutionGridApi = event.api;
        this.institutionGridApi.setRowData(this.labInstitutions);
        this.institutionGridApi.sizeColumnsToFit();
    }

    public onInstitutionGridRowSelected(event: RowSelectedEvent): void {
        this.institutionToRemove = event.data;
    }

    public addInstitution(): void {
        if (this.institutionToAddControl.value) {
            if (!this.labInstitutions.includes(this.institutionToAddControl.value)) {
                this.labInstitutions.push(this.institutionToAddControl.value);
                this.institutionGridApi.setRowData(this.labInstitutions);
                this.institutionToRemove = null;
                this.institutionsChanged = true;
            }
            this.institutionToAddControl.setValue("");
        }
    }

    public removeInstitution(): void {
        if (this.institutionToRemove) {
            this.labInstitutions.splice(this.labInstitutions.indexOf(this.institutionToRemove), 1);
            this.institutionGridApi.setRowData(this.labInstitutions);
            this.institutionToRemove = null;
            this.institutionsChanged = true;
        }
    }

    public onEditInstitutions(): void {
        let dialogRef: MatDialogRef<EditInstitutionsComponent> = this.dialog.open(EditInstitutionsComponent);
        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                this.buildInstitutions();
            }
        });
    }

    private resetInstitutionControls(): void {
        this.institutionToAddControl.setValue("");
        this.institutionToRemove = null;
        this.institutionsChanged = false;
    }

    searchInstitution(event) {
        let params: URLSearchParams = new URLSearchParams();
        params.set("idCoreFacility", "");
        params.set("idInstitution", event.value);
        params.set("isExternal", "");
        params.set("listKind", "UnboundedLabList");


        this.buildGroups(params);
    }

    newGroup() {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.height = '35em';
        configuration.width  = '20em';

        this.createGroupDialogRef = this.dialog.open(NewGroupDialogComponent, configuration);
        this.createGroupDialogRef.afterClosed()
            .subscribe(result => {
                if (this.createGroupDialogRef.componentInstance.rebuildGroups) {
                    this.buildLabList();
                }
            })

    }

    deleteGroup() {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.height = '10em';
        configuration.width  = '20em';

        configuration.data = {
            idLab: this.idLab,
            labName: this.selectedGroup[this.prefService.labDisplayField]
        };

        this.deleteGroupDialogRef = this.dialog.open(DeleteGroupDialogComponent, configuration);
        this.deleteGroupDialogRef.afterClosed()
            .subscribe(result => {
                if (this.deleteGroupDialogRef.componentInstance.rebuildGroups) {
                    this.buildLabList();
                }
            })

    }

    verify(mode: string) {
        let theLabId = (mode === 'lab' ? this.idLab : "");

        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.height = '16em';
        configuration.width  = '20em';

        configuration.data = {
            idLab: theLabId,
            labName: this.selectedGroup[this.prefService.labDisplayField]
        };

        this.verifyUsersDialogRef = this.dialog.open(VerifyUsersDialogComponent, configuration);
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
        if (this.showInstitutions && this.institutionsChanged) {
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

import {
    AfterViewChecked,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {URLSearchParams} from "@angular/http";
import {MatDialogConfig, MatSnackBar, MatSnackBarConfig} from "@angular/material";

import {GridOptions} from "ag-grid-community/main";
import {ColDef, GridApi, GridReadyEvent, RowSelectedEvent, RowNode} from "ag-grid-community";

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
import {EditInstitutionsComponent} from "../util/edit-institutions.component";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";
import {TabSeqSetupViewComponent} from "../experiments/new-experiment/tab-seq-setup-view.component";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

/**
 * @title Basic tabs
 */
@Component({
    selector: 'users-groups-tablist',
    templateUrl: './users-groups-tablist.component.html',
    styles: [`

        .min-width {
            min-width: 15em;
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
export class UsersGroupsTablistComponent implements AfterViewChecked, OnInit, OnDestroy {

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


    public get disable_isActive_lab(): boolean {
        if (this.createSecurityAdvisorService.isSuperAdmin) {
            return false;
        } else if (this.selectedGroup
            && this.selectedGroup.managers
            && Array.isArray(this.selectedGroup.managers)) {

            let temp: any[] = this.selectedGroup.managers.filter((a: any) => {
                return "" + a.idAppUser === "" + this.createSecurityAdvisorService.idAppUser;
            });

            return temp.length === 0;
        } else {
            return true;
        }
    }

    public get isActive_lab(): boolean {
        return this.selectedGroup
            && this.selectedGroup.isActive
            && this.selectedGroup.isActive === 'Y';
    }
    public set isActive_lab(value: boolean ){
        if (this.selectedGroup && this.selectedGroup.isActive) {
            this.selectedGroup.isActive = (value ? 'Y' : 'N');
        }
    }
    public onChange_isActive(event: any) {
        if (event && event.checked && event.checked === true) {
            this.selectedGroup.isActive = 'Y';
        } else {
            this.selectedGroup.isActive = 'N';
        }
    }


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
    private userForm: FormGroup;
    private groupForm: FormGroup;
    private selectedUser: any = "";
    private selectedGroup: any = "";
    private isActive: boolean;
    public codeUserPermissionKind: string;
    public coreFacilitiesICanSubmitTo: any[];
    public coreFacilitiesIManage: any[];
    public searchText: string;
    public selectedTab: number = 0;
    public selectedGroupTab: number = 0;
    public showSpinner: boolean = false;
    private isActiveChanged: boolean = false;
    private beingIsActive: boolean = false;
    panelOpenState: boolean = false;
    public externalGroup: boolean = false;
    public groupFormDirty: boolean = false;
    public groupFormValid: boolean = false;
    private userLabel: string;
    private groupLabel: string;

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


    constructor(public secAdvisor: CreateSecurityAdvisorService,
                public passwordUtilService: PasswordUtilService,
                public constantsService: ConstantsService,
                private appUserListService: AppUserListService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private formBuilder: FormBuilder,
                private snackBar: MatSnackBar,
                private dialogsService: DialogsService,
                private getLabService: GetLabService,
                private labListService: LabListService,
                private dictionaryService: DictionaryService,
                private changeRef: ChangeDetectorRef,
                public prefService: UserPreferencesService,
                private propertyService: PropertyService,
                private utilService: UtilService) {
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
                hide: true
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
                width: 1,
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
        this.utilService.registerChangeDetectorRef(this.changeRef);
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
                    lab.icon = "./assets/graduation_cap.png";
                } else if (lab.isExternalPricingCommercial === 'Y') {
                    lab.pricing = 'com';
                    lab.icon = "./assets/building.png";
                } else {
                    lab.pricing = "int";
                    lab.icon = "./assets/empty.png";
                }
            }
        }
    }

    public buildUsers(idAppUserToSelect?: string) {
        this.selectedUser = null;
        this.rowData = [];
        if (this.secAdvisor.isAdmin || this.secAdvisor.isSuperAdmin || this.secAdvisor.isBillingAdmin) {
            this.getAppUserListSubscription = this.appUserListService.getFullAppUserList().subscribe((response: any) => {
                let res: any[] = [];
                res = UtilService.getJsonArray(response, response.AppUser);
                this.userLabel = res.length + " users";
                this.createUserForm();
                this.userForm.markAsPristine();
                this.touchUserFields();
                this.rowData = res;

                if (idAppUserToSelect) {
                    setTimeout(() => {
                        this.gridOptions.api.forEachNode((node: RowNode) => {
                            if (node.data.idAppUser === idAppUserToSelect) {
                                node.setSelected(true);
                                this.gridOptions.api.ensureIndexVisible(node.rowIndex);
                            }
                        });
                    });
                }
            }, (err: IGnomexErrorResponse) => {});
        }
    }

    public buildGroups(params: HttpParams) {
        this.labListService.getLabListWithParams(params).subscribe((response: any) => {
            this.groupsData = response ? UtilService.getJsonArray(response, response.Lab) : [];
            this.groupLabel = this.groupsData.length + " groups";
            this.setPricing();
        }, (err: IGnomexErrorResponse) => {
        });
    }

    private touchGroupFields() {
        for (let field in this.groupForm.controls) {
            const control = this.groupForm.get(field);
            if (control) {
                if (control.valid === false) {
                    control.markAsTouched();
                }
            }
        }
    }

    private touchUserFields(): void {
        for (let field in this.userForm.controls) {
            const control = this.userForm.get(field);
            if (control) {
                if (control.valid === false) {
                    control.markAsTouched();
                }
            }
        }
    }

    private buildLabList(idLabToSelect?: string): void {

        let params: HttpParams = new HttpParams()
            .set("idCoreFacility", this.idCoreFacility ? this.idCoreFacility : "")
            .set("idInstitution", "")
            .set("isExternal", "")
            .set("listKind", "UnboundedLabList");

        this.getGroupListSubscription = this.labListService.getLabListWithParams(params).subscribe((response: any[]) => {
            this.buildManagedLabList(response);

            if (this.secAdvisor.isSuperAdmin || this.secAdvisor.isAdmin || this.secAdvisor.isBillingAdmin) {
                this.groupsData = this.myManagingLabs;
            } else {
                this.groupsData = this.secAdvisor.groupsToManage;
            }

            this.groupLabel = this.groupsData.length + " lab groups";
            this.createGroupForm();
            this.setPricing();

            if (idLabToSelect) {
                setTimeout(() => {
                    this.groupsGridOptions.api.forEachNode((node: RowNode) => {
                        if (node.data.idLab === idLabToSelect) {
                            node.setSelected(true);
                            this.groupsGridOptions.api.ensureIndexVisible(node.rowIndex);
                        }
                    });
                });
            }
        }, (err: IGnomexErrorResponse) => {
        });
    }

    private buildManagedLabList(labs: any[]): void {
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

    public onSplitDragEnd(event: any): void {
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

    private setUserValues(): void {
        for (let core of this.coreFacilitiesICanSubmitTo) {
            this.userForm.controls[core.display].patchValue(core.isSelected, {onlySelf: true, emitEvent: true});
        }
        for (let core of this.coreFacilitiesIManage) {
            this.userForm.controls[core.display + 'm'].patchValue(core.isSelected, {onlySelf: true, emitEvent: true});
        }

        this.userForm.patchValue({
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

    private setGroupValues(): void {
        for (let core of this.myCoreFacilities) {
            this.groupForm.controls[core.display].patchValue(core.isSelected, {onlySelf: true, emitEvent: true});
        }

        this.groupForm.patchValue({
            firstName: this.selectedGroup.firstName,
            lastName: this.selectedGroup.lastName,
            pricing: this.selectedGroup.pricing,
            contactPhone: this.selectedGroup.contactPhone,
            contactEmail: this.selectedGroup.contactEmail
        });
    }

    private createUserForm(): void {
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
            lastName:  ['', [ Validators.required ]],
            firstName: ['', [ Validators.required ]],
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

    private createGroupForm(): void {
        this.groupEmailFC = new FormControl("", [Validators.required, Validators.pattern("^((\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*)\\s*[,]{0,1}\\s*)+$")]);
        this.pricingFC = new FormControl("", Validators.required);
        this.groupPhoneFC = new FormControl("");

        this.groupForm = this.formBuilder.group({
            lastName: '',
            firstName: '',
            contactEmail: this.groupEmailFC,
            contactPhone: this.groupPhoneFC,
            pricing: this.pricingFC
        }, { validator: UsersGroupsTablistComponent.atLeastOneNameRequired});
    }

    public static atLeastOneNameRequired(group : FormGroup): void {
        if (group) {
            if (group.controls['lastName'].value || group.controls['firstName'].value) {

                group.controls['lastName'].setErrors(null);
                group.controls['firstName'].setErrors(null);
            } else {
                group.controls['lastName'].setErrors({'incorrect': true});
                group.controls['firstName'].setErrors({'incorrect': true});
            }
        }
    }

    public search(): void {
        this.gridOptions.api.setQuickFilter(this.searchText);
    }

    public searchGroups(event) {
        this.groupsGridOptions.api.setQuickFilter(this.searchText);
    }

    public onSelectionChanged(event?: any) {
        this.dialogsService.startDefaultSpinnerDialog();

        let selectedRows = this.gridOptions.api.getSelectedRows();
        this.idAppUser = selectedRows[0].idAppUser;
        let params: HttpParams = new HttpParams()
            .set("idAppUser", this.idAppUser);
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

            this.dialogsService.stopAllSpinnerDialogs();
        }, (err: IGnomexErrorResponse) => {
            this.dialogsService.stopAllSpinnerDialogs();
        });
    }

    public onGroupsSelectionChanged(event?: any) {
        this.dialogsService.startDefaultSpinnerDialog();

        let params: HttpParams = new HttpParams();
        let selectedRows = this.groupsGridOptions.api.getSelectedRows();
        this.idLab = selectedRows[0].idLab;
        this.myCoreFacilities = [];
        params = params.set("idLab", this.idLab);

        this.getLabService.getLab(params).subscribe((response: any) => {
            this.selectedGroup = response.Lab;
            this.isBillingAccountsTabDirty = false;
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

    private selectPermissionLevel(permissionKind: any) {
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

    public onIsActiveChange(event: any): void {
        this.isActiveChanged = true;
    }

    public onTabChange(event: any): void {
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

    private selectSubmissionCheckbox(getAppUser: any) {
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

    private buildGroupCoreControls(): any[] {
        let myCoreFacilities: any[] = [];

        if (!this.secAdvisor.isArray(this.selectedGroup.coreFacilities)) {
            this.selectedGroup.coreFacilities = [this.selectedGroup.coreFacilities.CoreFacility];
        }

        let myCores = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.CoreFacility");

        myCores = myCores.filter((value) => { return !value.isActive || value.isActive !== 'N'; });

        myCores = myCores.sort(TabSeqSetupViewComponent.sortBySortOrderThenDisplay);

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

    public newUser(): void {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.height = '20em';
        configuration.width  = '40em';

        let actions: any = {
            actions: [
                {type: ActionType.PRIMARY, icon: this.constantsService.ICON_SAVE, name: "Save", internalAction: "save"},
                {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
            ]
        };

        this.dialogsService.genericDialogContainer(NewUserDialogComponent, "Add User", this.constantsService.ICON_USER, configuration, actions).subscribe((result: any) => {
            this.buildUsers(result);
        });
    }

    public deleteUser(): void {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.height = '11em';
        configuration.width  = '24em';

        configuration.data = {
            idAppUser: this.idAppUser,
            userName: this.selectedUser[this.prefService.userDisplayField]
        };

        let actions: any = {
            actions: [
                {type: ActionType.PRIMARY, name: "Yes", internalAction: "delete"},
                {type: ActionType.SECONDARY, name: "No", internalAction: "onClose"}
            ]
        };

        this.dialogsService.genericDialogContainer(DeleteUserDialogComponent, "Delete User", this.constantsService.ICON_USER, configuration, actions).subscribe((result: any) => {
            if(result) {
                this.buildUsers();
            }
        });
    }

    public onGridReady(event: any) {
        if (event && event.api) {
            event.api.sizeColumnsToFit();
        }
    }

    private setCoreFacilities(): number {
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

    private buildLabsMessage (): string {
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

    private save(): void {
        let stringifiedSF: string = "";
        let stringifiedMF: string = "";
        this.showSpinner = true;

        let params: HttpParams = new HttpParams()
            .set("idAppUser", this.idAppUser)
            .set("codeUserPermissionKind", this.codeUserPermissionKind)
            .set("idAppUser", this.selectedUser.idAppUser.toString())
            .set("firstName", this.userForm.controls['firstName'].value)
            .set("lastName", this.userForm.controls['lastName'].value)
            .set("institute", this.userForm.controls['institute'].value)
            .set("department", this.userForm.controls['department'].value)
            .set("email", this.userForm.controls['email'].value)
            .set("phone", this.userForm.controls['phone'].value)
            .set("ucscUrl", this.userForm.controls['ucscUrl'].value);
        if (this.isActiveFC.value === false) {
            params = params.set("isActive", 'N');
        } else {
            params = params.set("isActive", 'Y');
        }
        if (this.beingIsActive === false) {
            params = params.set("beingInactivated", 'N');
        } else {
            params = params.set("beingInactivated", 'Y');
        }
        if (this.usertypeFC.value === this.USER_TYPE_UNIVERSITY) {
            params = params.set("uNID", this.userForm.controls['uNid'].value);
        } else if (this.usertypeFC.value === this.USER_TYPE_EXTERNAL) {
            params = params.set("userNameExternal", this.userForm.controls['userName'].value);
            params = params.set("passwordExternal", this.userForm.controls['password'].value === this.DUMMY_PASSWORD ? this.PASSWORD_MASKED : this.userForm.controls['password'].value);
            params = params.set("uNID", "");
        }
        if (this.coreFacilitiesICanSubmitTo.length > 0) {
            stringifiedSF = JSON.stringify(this.coreFacilitiesICanSubmitTo);
        }
        if (this.coreFacilitiesIManage.length > 0) {
            stringifiedMF = JSON.stringify(this.coreFacilitiesIManage);
        }
        params = params.set("coreFacilitiesUserCanSubmitTo", stringifiedSF);
        params = params.set("userManagingCoreFacilities", stringifiedMF);
        this.appUserListService.saveAppUser(params).subscribe((response: any) => {
            this.userForm.markAsPristine();
            this.touchUserFields();

            let config: MatSnackBarConfig = new MatSnackBarConfig();
            config.duration = 3000;

            this.snackBar.open("Changes Saved", "User", config);
            this.buildUsers(response.idAppUser);

            this.showSpinner = false;
        }, (error: IGnomexErrorResponse) =>{
            this.userForm.markAsPristine();
            this.showSpinner = false;
        });


    }

    public saveUser(): void {
        let coresIManage = this.setCoreFacilities();

        if (this.codeUserPermissionKind === 'ADMIN' && coresIManage === 0) {
            this.dialogsService.alert("The user is marked as an admin; Please specify the core facilities the user can manage.", null);
        } else {
            if (this.isActiveChanged && this.isActiveFC.value == false) {
                if ( this.isMemberOfLab()) {
                    let activeMessage = this.buildLabsMessage();
                    this.dialogsService.confirm("Inactivating this user will remove them from the following lab(s):<br>" + activeMessage).subscribe(answer => {
                        if (answer) {
                            this.beingIsActive = true;
                            this.save();
                        }
                    });
                } else {
                    this.dialogsService.confirm("This will inactivate the user").subscribe(answer => {
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

    public saveLab(): void {

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
            if (!UsersGroupsTablistComponent.areChartfieldFieldsBlank(account)) {
                warningMessages.push('Will clear chartfield account fields from new PO account "' + account.accountName + '"');
            } if (!this.areCreditCardFieldsBlank(account)) {
                warningMessages.push('Will clear credit card account fields from new PO account "' + account.accountName + '"');
            }
        }
        for (let account of creditCardAccounts) {
            if (!this.arePoFieldsBlank(account)) {
                warningMessages.push('Will clear PO account fields from new credit card account "' + account.accountName + '"');
            } if (!UsersGroupsTablistComponent.areChartfieldFieldsBlank(account)) {
                warningMessages.push('Will clear chartfield account fields from new credit card account "' + account.accountName + '"');
            }
        }

        if (warningMessages.length > 0) {
            warningMessages.push(' ');
            warningMessages.push('Continue with save anyway?');

            this.dialogsService.confirm(warningMessages).subscribe((result: any) => {
                if(result) {
                    this.dialogsService.startDefaultSpinnerDialog();
                    this.saveGroup();
                }
            });
        } else {
            this.dialogsService.startDefaultSpinnerDialog();
            this.saveGroup();
        }
    }

    private static areChartfieldFieldsBlank(billingAccount: any): boolean {
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

        //this method tells all grids to stop editing. need Timeout to make sure all events handlers have had time to run
        this.billingAccountTab.prepBillingAccountForSave();
        setTimeout(()=>{
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
                params = params.set("isActive", this.selectedGroup.isActive);
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
                    this.buildLabList(responseJSON.idLab);
                    this.onGroupsSelectionChanged();
                }
                this.dialogsService.stopAllSpinnerDialogs();
                this.showSpinner = false;
            }, (err: IGnomexErrorResponse) => {
                this.dialogsService.stopAllSpinnerDialogs();
                this.showSpinner = false;
            });

        });

    }

    addAppUser(users: any[]): any[] {
        let appUsers: any[] = [];

        for (let user of users) {
            appUsers.push({"AppUser": user});
        }

        return appUsers;
    }

    searchCoreFacility(event) {
        let params: HttpParams = new HttpParams()
            .set("idCoreFacility", event ? event : "")
            .set("idInstitution", "")
            .set("isExternal", "")
            .set("listKind", "UnboundedLabList");

        this.buildGroups(params);
    }

    onExternalGroupChange(event) {
        let params: HttpParams = new HttpParams()
            .set("idCoreFacility", "")
            .set("idInstitution", "");
        if (event.checked) {
            params = params.set("isExternal", "Y");
        } else {
            params = params.set("isExternal", "N");
        }
        params = params.set("listKind", "UnboundedLabList");

        this.buildGroups(params);
    }

    private buildInstitutions() {
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
        let config: MatDialogConfig = new MatDialogConfig();
        config.autoFocus = false;
        this.dialogsService.genericDialogContainer(EditInstitutionsComponent, "Edit Institutions", null, config,
            {actions: [
                    {type: ActionType.PRIMARY, icon: this.constantsService.ICON_SAVE, name: "Save", internalAction: "save"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]}).subscribe((result: any) => {
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
        let params: HttpParams = new HttpParams()
            .set("idCoreFacility", "")
            .set("idInstitution", event ? event : "")
            .set("isExternal", "")
            .set("listKind", "UnboundedLabList");

        this.buildGroups(params);
    }

    public newGroup(): void {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.height = '35em';
        configuration.width  = '40em';

        let actions: any = {
            actions: [
                {type: ActionType.PRIMARY, icon: this.constantsService.ICON_SAVE, name: "Save", internalAction: "save"},
                {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
            ]
        };

        this.dialogsService.genericDialogContainer(NewGroupDialogComponent, "Add Group", this.constantsService.ICON_USER, configuration, actions).subscribe((result: any) => {
            if(result) {
                this.selectedGroup = null;
                this.buildLabList(result);
            }
        });
    }

    deleteGroup() {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.height = '10em';
        configuration.width  = '20em';

        configuration.data = {
            idLab: this.idLab,
            labName: this.selectedGroup[this.prefService.labDisplayField]
        };

        this.dialogsService.genericDialogContainer(DeleteGroupDialogComponent, "Delete Group", this.constantsService.ICON_USER, configuration,
            {actions: [
                    {type: ActionType.PRIMARY, name: "Yes", internalAction: "delete"},
                    {type: ActionType.SECONDARY, name: "No", internalAction: "onClose"}
                ]}).subscribe((result: any) => {
            if(result) {
                this.selectedGroup = null;
                this.buildLabList();
            }
        });

    }

    verify(mode: string) {
        let theLabId = (mode === 'lab' ? this.idLab : "");

        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.height = '16em';
        configuration.width  = '30em';

        configuration.data = {
            idLab: theLabId,
            labName: mode === 'lab' ? this.selectedGroup[this.prefService.labDisplayField] : ""
        };

        this.dialogsService.genericDialogContainer(VerifyUsersDialogComponent, "Send Email",
            this.constantsService.EMAIL_GO_LINK, configuration, {actions: [
                    {type: ActionType.PRIMARY, name: "Yes", internalAction: "verify"},
                    {type: ActionType.SECONDARY, name: "No", internalAction: "onClose"}
                ]});

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
        if (this.isBillingAccountsTabDirty) {
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

    ngOnDestroy(): void {
        this.utilService.removeChangeDetectorRef(this.changeRef);
    }

    private isBillingAccountsTabDirty: boolean = false;

    onManualDirty() {
        this.isBillingAccountsTabDirty = true;
    }
}

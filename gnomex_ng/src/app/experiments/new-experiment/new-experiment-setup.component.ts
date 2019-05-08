import {Component, EventEmitter, Input, OnDestroy, Output, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {URLSearchParams} from "@angular/http";
import {MatAutocomplete, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";

import {BehaviorSubject, Subscription} from "rxjs/index";
import {first} from "rxjs/internal/operators";

import {NewExperimentService} from "../../services/new-experiment.service";
import {GnomexService} from "../../services/gnomex.service";
import {GetLabService} from "../../services/get-lab.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {HttpParams} from "@angular/common/http";
import {BillingService} from "../../services/billing.service";
import {DictionaryService} from "../../services/dictionary.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {WorkAuthorizationTypeSelectorDialogComponent} from "../../products/work-authorization-type-selector-dialog.component";

import {Experiment} from "../../util/models/experiment.model";
import {UserPreferencesService} from "../../services/user-preferences.service";
import {ExperimentsService} from "../experiments.service";

@Component({
    selector: "new-experiment-setup",
    templateUrl: "./new-experiment-setup.component.html",
    styles: [`

        li { margin-bottom: 0.7em; }

        ol.three-depth-numbering {
            padding: 0;
            margin: 0;
            list-style-type: none;
            counter-reset: section;
        }
        ol.three-depth-numbering li {
            display: flex;
            flex-direction: row;
        }
        ol.three-depth-numbering li::before {
            counter-increment: section;
            content: "(" counter(section) ")";
            padding-right: 0.3em;
        }
        ol.three-depth-numbering li ol {
            padding: 0;
            margin: 0;
            list-style-type: none;
            counter-reset: subsection;
        }
        ol.three-depth-numbering li ol li {
            display: flex;
            flex-direction: row;
        }
        ol.three-depth-numbering li ol li::before {
            counter-increment: subsection;
            content: "(" counter(section) "." counter(subsection) ")";
            padding-right: 0.3em;
        }
        ol.three-depth-numbering li ol li ol {
            padding: 0;
            margin: 0;
            list-style-type: none;
            counter-reset: subsubsection;
        }
        ol.three-depth-numbering li ol li ol li {
            display: flex;
            flex-direction: row;
        }
        ol.three-depth-numbering li ol li ol li::before {
            counter-increment: subsubsection;
            content: "(" counter(section) "." counter(subsection) "." counter(subsubsection) ")";
            padding-right: 0.3em;
        }


        .heading {
            min-width: 20em;
            padding-right: 2em;
        }

        .label-width {
            width: 20em;
            min-width: 20em;
        }
        .moderate-width {
            width: 40em;
            min-width: 20em;
        }
        .long-width {
            width: 80em;
            min-width: 40em;
        }


        .bordered { border: 1px solid silver; }
        
        .extra-padded { padding: 1em;}

        .double-padded-left { padding-left: 0.6em; }
        .major-padding-left { padding-left: 1.0em; }

        .font-small { font-size: small; }

        .word-wrap { white-space: pre-line; }


        .mat-radio-container {
            height: 1em !important;
            width:  1em !important;
            padding-top: 0.3em !important;
            margin-right: 0.3em !important;
        }


        .instructions {
            font-style: italic;
        }

        .link-button {
            font-size: small;
            text-decoration: underline;
            color: blue
        }
    
    `]
})
export class NewExperimentSetupComponent implements OnDestroy {

    @ViewChild("autoLab") autoLab: MatAutocomplete;

    @Input("experiment") set experiment(value: Experiment) {
        this._experiment = value;
    }

    @Input("QCChipPriceListSubject") set QCChipPriceListSubject (value: BehaviorSubject<any[]>) {
        if (value) {
            this.QCChipPriceList = value;
        }
    }

    @Input("idCoreFacility") set idCoreFacility (value: any) {
        this.requestCategories = [];
        this.newExperimentService.components = [];
        // this.newExperimentService.organisms = [];
        // this.newExperimentService.componentRefs = [];
        // this.newExperimentService.samplesGridRowData = [];

        if (value) {
            this._experiment.idCoreFacility = value;
            this.coreFacility = this.dictionaryService.getEntry('hci.gnomex.model.CoreFacility', this._experiment.idCoreFacility);

            this.requestCategories = this.getFilteredRequestCategories().sort(NewExperimentSetupComponent.sortRequestCategory);


            this.labList = this.gnomexService.labList.filter((lab) => {
                return lab.canGuestSubmit === 'Y' || lab.canSubmitRequests === 'Y';
            });

            this.form = this.formBuilder.group({
                selectedCategory: ['', Validators.required],
                selectLab:        ['', Validators.required],
                selectName:       ['', Validators.required],
                selectProject:    ['', Validators.required],
                selectAccount:    ['', Validators.required],
                experimentName:   [''],
                description:      ["", Validators.maxLength(5000)]
            });

            this.filteredProjectList = this.gnomexService.projectList;
            this.checkSecurity();
            this.newExperimentService.components.push(this);
            // this.newExperimentService.setupView = this;
        }
    }

    @Output("onChangeRequestCategory") onChangeRequestCategory = new EventEmitter<any>();
    @Output("onChangeLab") onChangeLab= new EventEmitter<any>();

    public get description(): string {
        return this._experiment.description;
    }
    public set description(value: string) {
        this._experiment.description = value;
    }

    public form: FormGroup;

    private _experiment: Experiment;

    private labList: any[] = [];

    public requestCategories: any[] = [];
    public possibleSubmitters: any[] = [];
    public authorizedBillingAccounts: any;
    public filteredProjectList: any[] = [];

    private coreFacility: any;
    private defaultCodeRequestCategory: any = null;

    private adminState: string;
    private currentIdLab: string;

    private QCChipPriceList: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

    private workButtonText: string;

    private workAuthInstructions: string;
    private accessAuthorizedBillingAccountInstructions: string;


    private possibleSubmitters_loaded: boolean = false;

    private _showBilling_previousValue: boolean = false;

    private showAccessAuthorizedAccountsLink: boolean = false;


    private submittersSubscription: Subscription;


    // public get isValid(): boolean {
    //     return this.form && this.form.valid;
    // }

    private project: any;

    public get submitter(): any {
        if (this.form && this.form.get('selectName')) {
            return this.form.get('selectName').value;
        }

        return { };
    }
    public set submitter(value: any) {
        if (this.form.get('selectName') && this.form.get('selectName').value) {

            this._experiment.experimentOwner = this.form.get('selectName').value;
            this._experiment.idOwner = this.form.get('selectName').value.idAppUser;
        }

        this.selectDefaultUserProject();
    }


    // private showPool: boolean = false;

    public get showLab(): boolean {
        return !!(this.form && this.form.get("selectedCategory").value)
            || !this.gnomexService.submitInternalExperiment();
    }
    public get showName(): boolean {
        return this.showLab
            && this.form
            && this.form.get('selectLab')
            && this.form.get('selectLab').valid
            && !!this.possibleSubmitters
            && this.possibleSubmitters_loaded === true
            && this.adminState === 'AdminState';
    }
    public get showBilling(): boolean {

        let newValue: boolean = (this.showName && this.adminState === 'AdminState' && this.form && this.form.get('selectName') && this.form.get('selectName').valid)
            || (this.showLab && this.form && this.form.get('selectLab') && this.form.get('selectLab').valid && this.adminState !== 'AdminState');

        // If there is only one choice for billing account, automatically select it for the user.
        if (this.authorizedBillingAccounts
            && Array.isArray(this.authorizedBillingAccounts)
            && this.authorizedBillingAccounts.length === 1
            && this.form.get("selectAccount")
            && (this._showBilling_previousValue === false && newValue === true)) {

            this.form.get("selectAccount").setValue(this.authorizedBillingAccounts[0]);

            // These spoofedEvents are needed in places where the field is assigned a
            // default value, because (selectionChanged) does not pick up changes to the
            // form value.
            let spoofedEvent = { source: { value: this.authorizedBillingAccounts[0] } };
            this.onBillingSelection(spoofedEvent);
        }

        this._showBilling_previousValue = newValue;

        return newValue;
    }
    public get showProject(): boolean {
        return this.showBilling
            && this.form
            && this.form.get('selectAccount')
            && this.form.get('selectAccount').valid;
    }
    public get showExperimentName(): boolean {
        return this.showProject;
    }
    public get showExperimentTextbox(): boolean {
        return this.showExperimentName;
    }


    constructor(private billingService: BillingService,
                private createSecurityAdvisor: CreateSecurityAdvisorService,
                private dialog: MatDialog,
                private dialogService: DialogsService,
                private dictionaryService: DictionaryService,
                private experimentService: ExperimentsService,
                private formBuilder: FormBuilder,
                private getLabService: GetLabService,
                private gnomexService: GnomexService,
                private newExperimentService: NewExperimentService,
                public prefService: UserPreferencesService) {

        this.form = this.formBuilder.group({
            selectedCategory: ['', Validators.required],
            selectLab:        ['', Validators.required],
            selectName:       ['', Validators.required],
            selectProject:    ['', Validators.required],
            selectAccount:    ['', Validators.required],
            experimentName:   [''],
            description:      ["", Validators.maxLength(5000)]
        });
    }


    ngOnDestroy() {
        if (this.submittersSubscription) {
            this.submittersSubscription.unsubscribe();
        }
    }


    reinitialize(): void {
        if (this.form) {
            if (this.form.get("selectedCategory")) {
                this.form.get("selectedCategory").setValue(null);
            }
            if (this.form.get("selectLab")) {
                this.form.get("selectLab").setValue(null);
            }
            if (this.form.get("selectName")) {
                this.form.get("selectName").setValue(null);
            }
            if (this.form.get("selectProject")) {
                this.form.get("selectProject").setValue(null);
            }
            if (this.form.get("selectAccount")) {
                this.form.get("selectAccount").setValue(null);
            }
            if (this.form.get("experimentName")) {
                this.form.get("experimentName").setValue(null);
            }
            if (this.form.get("description")) {
                this.form.get("description").setValue(null);
            }
        }

        this.requestCategories = [];
        this.labList = [];
        this.possibleSubmitters = [];
        this.authorizedBillingAccounts = [];
        this.filteredProjectList = [];
    }


    refreshBillingAccounts() {
        this.checkForOtherAccounts();
        // this.newExperimentService.idAppUser = this.createSecurityAdvisor.idAppUser.toString();
        this._experiment.idAppUser = this.createSecurityAdvisor.idAppUser.toString();

        let cat = this._experiment.requestCategory;

        if (this.authorizedBillingAccounts) {
            if (!Array.isArray(this.authorizedBillingAccounts)) {
                this.authorizedBillingAccounts = [this.authorizedBillingAccounts.BillingAccount];
            }

            this.authorizedBillingAccounts = this.authorizedBillingAccounts.filter(account => {
                return account &&
                    ((account.overrideFilter && account.overrideFilter === 'Y')
                        || (cat.idCoreFacility && account.idCoreFacility && account.idCoreFacility === cat.idCoreFacility)
                    );
            });
        }
        // this.selectDefaultUserProject();
    }

    checkForOtherAccounts(): void {
        if (this.createSecurityAdvisor.isAdmin || this.createSecurityAdvisor.isBillingAdmin || this.createSecurityAdvisor.isSuperAdmin) {
            this.showAccessAuthorizedAccountsLink = true;
            let authorizedBillingAccountsParams: HttpParams = new HttpParams().set("idCoreFacility", this._experiment.idCoreFacility);

            this.billingService.getAuthorizedBillingAccounts(authorizedBillingAccountsParams).subscribe((response: any) => {
                this.showAccessAuthorizedAccountsLink = response && response.hasAccountsWithinCore && response.hasAccountsWithinCore === 'Y';
            });
        } else if (this._experiment.idAppUser != null && this._experiment.idAppUser != '') {
            let idCoreFacility: string = this._experiment.idCoreFacility;
        }
    }


    checkSecurity(): void {
        let iCanSubmitToThisCoreFacility: boolean = !!this.gnomexService.coreFacilitiesICanSubmitTo.find((a) => {
            return this.coreFacility && a.idCoreFacility === this.coreFacility.idCoreFacility;
        });

        if (this.gnomexService.hasPermission("canWriteAnyObject")) {
            if (this.gnomexService.submitInternalExperiment()) {
                this.adminState = "AdminState";
            } else {
                this.adminState = "AdminExternalExperimentState";
            }

            if (this.form.controls['selectName'].value && this.form.controls['selectName'].value.idAppUser !== '' ) {
                // this.newExperimentService.idAppUser = this.form.controls['selectName'].value.idAppUser;
                this._experiment.idAppUser          = this.form.controls['selectName'].value.idAppUser;
            } else {
                // this.newExperimentService.idAppUser = "";
                this._experiment.idAppUser          = "";
            }
        } else if (this.gnomexService.hasPermission('canSubmitForOtherCores') && iCanSubmitToThisCoreFacility) {
            this.adminState = "AdminState";

            if (this.form.controls['selectName'].value && this.form.controls['selectName'].value.idAppUser !== '') {
                // this.newExperimentService.idAppUser = this.form.controls['selectName'].value.idAppUser;
                this._experiment.idAppUser          = this.form.controls['selectName'].value.idAppUser;
            } else {
                // this.newExperimentService.idAppUser = "";
                this._experiment.idAppUser          = "";
            }
        } else {
            if (this.gnomexService.submitInternalExperiment()) {
                this.adminState = "";
            } else {
                this.adminState = "ExternalExperimentState";
            }

            // Not permissible?
            // this.newExperimentService.idAppUser = this.createSecurityAdvisor.idAppUser.toString();
        }

        this.checkForOtherAccounts();

        this.workAuthInstructions = this.gnomexService.getProperty(this.gnomexService.PROPERTY_WORKAUTH_INSTRUCTIONS);
        this.accessAuthorizedBillingAccountInstructions = this.gnomexService.getProperty(this.gnomexService.PROPERTY_AUTH_ACCOUNTS_DESCRIPTION);

    }

    public selectDefaultUserProject(): void {
        this.form.controls['selectName'].setErrors(null);

        if (this._experiment.idAppUser != null) {
            for (let project of this.filteredProjectList) {
                if (this._experiment.experimentOwner
                    && this._experiment.experimentOwner.idAppUser === project.idAppUser) {

                    setTimeout(() => {
                        this.form.get('selectProject').setValue(project);
                        this.project = this.form.get('selectProject').value;

                        // These spoofedEvents are needed in places where the field is assigned a
                        // default value, because (selectionChanged) does not pick up changes to the
                        // form value.
                        let spoofedEvent: any = { source: { value: project } };
                        this.onProjectSelection(spoofedEvent);
                    });

                    break;
                }
            }
        }

        if (this.project) {
            this._experiment.idProject = this.project.idProject;
        }
    }


    getFilteredRequestCategories(): any[] {
        let categories: any[] = [];

        for (let category of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.RequestCategory")) {
            categories.push(category);
        }

        categories = categories.filter((category: any) => {
            return category.isActive === 'Y'
                && category.isInternal === 'Y'
                && this.coreFacility
                && ((category.codeRequestCategory === this.coreFacility.codeRequestCategory)
                    || ((!!category.isClinicalResearch || category.isClinicalResearch === '')
                        && category.isClinicalResearch !== 'Y'
                        && category.idCoreFacility
                        && category.idCoreFacility === this.coreFacility.idCoreFacility));
        });

        return categories;
    }


    public filterLabList(selectedLab: any) {
        let fLabs: any[];

        if (selectedLab) {
            if (selectedLab.idLab) {
                fLabs = this.labList.filter((lab) => {
                    return (lab
                        && lab.name
                        && ('' + lab.name).toLowerCase().indexOf(selectedLab.name.toLowerCase()) >= 0);
                });
                return fLabs;
            } else {
                fLabs = this.labList.filter(lab =>
                    lab.name.toLowerCase().indexOf(selectedLab.toLowerCase()) >= 0);
                return fLabs;
            }
        } else {
            return this.labList;
        }
    }


    onCategoryChange() {
        if (this.form && this.form.get("selectedCategory")) {
            // this.newExperimentService.category = this.form.get("selectedCategory").value;

            let code = this.form.get("selectedCategory").value;

            // Special code for CLINSEQ request from BST.
            if (code == null && this.defaultCodeRequestCategory != null) {
                code = this.defaultCodeRequestCategory;
            }

            this._experiment.requestCategory = this.dictionaryService.getEntry('hci.gnomex.model.RequestCategory', code.value);

            if (this._experiment.requestCategory) {
                // this.label = "New " + this.newExperimentService.requestCategory.display + " Experiment for " + this.coreFacility.display;

                this.workButtonText   = this.gnomexService.getCoreFacilityProperty(this._experiment.requestCategory.idCoreFacility, this.gnomexService.PROPERTY_REQUEST_WORK_AUTH_LINK_TEXT);
                // this.accessAuthLabel = this.gnomexService.getCoreFacilityProperty(this.newExperimentService.requestCategory.idCoreFacility, this.gnomexService.PROPERTY_ACCESS_AUTH_ACCOUNT_LINK_TEXT);
            }
        }

        this.onChangeRequestCategory.emit(this._experiment.requestCategory);

        if (this.labList && Array.isArray(this.labList) && this.labList.length === 1) {
            this.chooseFirstLabOption();
        }
    }

    public selectLabOption(event: any) {
        if (event && event.source && event.source.selected === true) {
            let value = event.source.value;
            this.filteredProjectList = this.gnomexService.projectList;

            if (!value.idLab) {
                return;
            }

            if (this._experiment && this._experiment.codeRequestCategory) {
                this.QCChipPriceList.next([]);

                this.experimentService.GetQCChipTypePriceList(this._experiment.codeRequestCategory, value.idLab).pipe(first()).subscribe((result) => {
                    if (result) {
                        if (Array.isArray(result)) {
                            this.QCChipPriceList.next(result);
                        } else {
                            this.QCChipPriceList.next([ result ]);
                        }
                    }
                });
            }

            if (this.currentIdLab !== value.idLab) {
                this.currentIdLab = value.idLab;
                this.onChangeLab.emit(value);

                this.form.get("selectName").setValue(null);
                this.form.markAsPristine();

                this.possibleSubmitters = [];
                this.possibleSubmitters_loaded = false;
                if (!this.submittersSubscription) {
                    this.submittersSubscription = this.getLabService.getSubmittersForLab(value.idLab, 'Y', 'N').subscribe((submitters: any[]) => {
                        if (submitters) {
                            this.possibleSubmitters = submitters.filter((a) => {
                                return a && a.isActive && a.isActive === 'Y';
                            });
                            this.possibleSubmitters.sort((a, b) => {
                                if (!a.displayName && !b.displayName) {
                                    return 0;
                                } else if (!a.displayName) {
                                    return -1;
                                } else if (!b.displayName) {
                                    return 1;
                                } else {
                                    if (a.displayName === b.displayName) {
                                        return 0;
                                    } else if (a.displayName > b.displayName) {
                                        return 1;
                                    } else {
                                        return -1;
                                    }
                                }
                            });
                            setTimeout(() => {
                                this.possibleSubmitters_loaded = true;
                            });
                        } else {
                            this.possibleSubmitters = [];
                            this.possibleSubmitters_loaded = false;
                        }
                    });
                } else {
                    this.getLabService.getSubmittersForLab(value.idLab, 'Y', 'N');
                }

                let params: URLSearchParams = new URLSearchParams();
                params.set("idLab", value.idLab);
                params.set("includeBillingAccounts", "Y");
                params.set("includeProductCounts", "N");
                this.getLabService.getLab(params).subscribe((response: any) => {
                    if (response && response.Lab && response.Lab.activeSubmitters) {
                        this.authorizedBillingAccounts = response.Lab.authorizedBillingAccounts;
                    }
                    this.filteredProjectList = this.filteredProjectList.filter(project =>
                        project.idLab === value.idLab
                    );

                    this.refreshBillingAccounts();
                });
            }

            this._experiment.lab = event.source.value;
            // this.newExperimentService.getHiSeqPriceList();
            // this.newExperimentService.request.idLab = this.newExperimentService.lab.idLab;
        }

        if (this.adminState !== "AdminState") {
            let temp: any[] = this.gnomexService.appUserList.filter((value: any) => {
                return value.idAppUser === '' + this.createSecurityAdvisor.idAppUser;
            });

            if (temp && temp.length === 1) {
                this._experiment.experimentOwner = temp[0];
                this._experiment.idOwner = '' + this.createSecurityAdvisor.idAppUser;

                this.selectDefaultUserProject();
            }
        }
    }

    public onBillingSelection(event: any): void {
        if (!event || !event.source) {
            return;
        }

        // this._experiment.idBillingAccount     = this.form.get("selectAccount").value.idBillingAccount;
        // this._experiment.billingAccountName   = this.form.get("selectAccount").value.billingAccountName;
        // this._experiment.billingAccountNumber = this.form.get("selectAccount").value.billingAccountNumber;
        //
        setTimeout(() => { this._experiment.billingAccount = this.form.get("selectAccount").value; });
        // this.getFilteredApps();
    }

    public onProjectSelection(event: any): void {
        if (!event || !event.source) {
            return;
        }

        this._experiment.idProject          = this.form.get("selectProject").value.idProject;
        this._experiment.project            = JSON.stringify(this.form.get("selectProject").value);
        this._experiment.projectName        = this.form.get("selectProject").value.display;
        this._experiment.projectDescription = this.form.get("selectProject").value.description;
    }

    public onChangeExperimentName(event: any): void {
        if (!event) {
            return;
        }

        this._experiment.name = this.form.get("experimentName").value;
    }

    public onInputExperimentalDetails(event: any): void {
        if (!event) {
            return;
        }

        this.description = this.form.get("description").value;
    }

    public chooseFirstLabOption(): void {
        this.autoLab.options.first.select();
    }

    public onClickNewAccount(): void {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.width  = "40em";
        configuration.height = "30em";
        configuration.panelClass = 'no-padding-dialog';
        configuration.data = { idLab: "" + this.currentIdLab };

        let dialogRef: MatDialogRef<WorkAuthorizationTypeSelectorDialogComponent> = this.dialog.open(WorkAuthorizationTypeSelectorDialogComponent, configuration);

        dialogRef.afterClosed().pipe(first()).subscribe(() => {
            this.dialogService.confirm('Confirmation', 'New accounts will require approval from billing administrator before use.');
        });
    }

    public onClickShowMoreAccounts(): void {
        //TODO: create dialog
    }

    public onClickSplitBilling(): void {
        //TODO: create dialog
    }

    public onClickEditProject(): void {
        //TODO: create dialog
    }

    public onClickNewProject(): void {
        //TODO: create dialog
    }

    // getFilteredApps() {
    //     this.newExperimentService.filteredApps = this.newExperimentService.filterApplication(this.newExperimentService.requestCategory, !this.showPool);
    // }


    private static sortRequestCategory(obj1: any, obj2: any): number {
        if (obj1 === null && obj2 === null) {
            return 0;
        } else if (obj1 == null) {
            return 1;
        } else if (obj2 == null) {
            return -1;
        } else {
            let idCore1: number = obj1.idCoreFacility === "" ? 999 : obj1.idCoreFacility;
            let idCore2: number = obj2.idCoreFacility === "" ? 999 : obj2.idCoreFacility;

            let sortOrder1: number = obj1.sortOrder === "" ? 999 : obj1.sortOrder;
            let sortOrder2: number = obj2.sortOrder === "" ? 999 : obj2.sortOrder;

            let display1: string = obj1.display;
            let display2: string = obj2.display;

            if (idCore1 < idCore2) {
                return -1;
            } else if (idCore1 > idCore2) {
                return 1;
            } else {
                if (sortOrder1 < sortOrder2) {
                    return -1;
                } else if (sortOrder1 > sortOrder2) {
                    return 1;
                } else {
                    if (display1 < display2) {
                        return -1;
                    } else if (display1 > display2) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }

        }
    }
}
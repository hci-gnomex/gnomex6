import {
    Component, ViewChild, ComponentRef, OnDestroy, OnInit, Output, EventEmitter
} from '@angular/core';
import {Form, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TabSampleSetupViewComponent} from "./tab-sample-setup-view.component";
import {DictionaryService} from "../../services/dictionary.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {BillingService} from "../../services/billing.service";
import {GetLabService} from "../../services/get-lab.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {GnomexService} from "../../services/gnomex.service";
import {NewExperimentService} from "../../services/new-experiment.service";
import {ExperimentsService} from "../experiments.service";
import {URLSearchParams} from "@angular/http";
import {HttpParams} from "@angular/common/http";
import {MatAutocomplete} from "@angular/material";
import {TabSeqSetupViewComponent} from "./tab-seq-setup-view.component";
import {AnnotationTabComponent, OrderType} from "../../util/annotation-tab.component";
import {TabSeqProtoViewComponent} from "./tab-seq-proto-view.component";
import {TabAnnotationViewComponent} from "./tab-annotation-view.component";
import {TabSamplesIlluminaComponent} from "./tab-samples-illumina.component";
import {Observable, Subscription} from "rxjs";
import {TabBioinformaticsViewComponent} from "./tab-bioinformatics-view.component";
import {TabConfirmIlluminaComponent} from "./tab-confirm-illumina.component";
import {VisibilityDetailTabComponent} from "../../util/visibility-detail-tab.component";

@Component({
    selector: 'new-experiment',
    templateUrl: "./new-experiment.component.html",
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
        
        .overflow { overflow: auto; }


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

export class NewExperimentComponent implements OnDestroy, OnInit {
    @ViewChild("autoLab") autoLabComplete: MatAutocomplete;
    @Output() properties = new EventEmitter<any[]>();

    types = OrderType;

    public tabs: any[];
    private selectedCategory: any;
    public requestCategories: any[] = [];
    private filteredProjectList: any[] = [];
    private authorizedBillingAccounts: any;
    public appPrices: any[] = [];
    private coreFacility: any;
    private sub: any;

    public label: string = "New Experiment Order for ";

    public icon: any;

    private form: FormGroup;
    private currentIdLab: string;
    private labList: Array<any>;

    private showAccessAuthorizedAccountsLink: boolean = false;
    private defaultCodeRequestCategory: any = null;
    private nextButtonIndex: number = -1;
    private adminState: string;
    private workAuthInstructions: string;
    private accessAuthorizedBillingAccountInstructions: string;
    private workAuthLabel: string;
    private accessAuthLabel: string;
    private annotations: any;
    private disableNext: boolean = true;
    private navigationSubscription: Subscription;
    private numTabs: number;
    private visibilityDetailObj: VisibilityDetailTabComponent;
    private showPool: boolean = false;


    public possibleSubmitters: any[] = [];

    private submittersSubscription: Subscription;

    inputs = {
        requestCategory: null,
    };

    outputs = {
        navigate: (type) => {
            if (type === '+') {
                this.goNext();
            } else {
                this.goBack();
            }
        }
    };
    annotationInputs = {
        annotations: this.annotations,
        orderType: this.types.EXPERIMENT,
        disabled: false
    };


    private possibleSubmitters_loaded: boolean = false;
    private _showBilling_previousValue: boolean = false;


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
            && this.possibleSubmitters_loaded === true;
    }
    public get showBilling(): boolean {

        let newValue: boolean = this.showName
            && this.form
            && this.form.get('selectName')
            && this.form.get('selectName').valid;

        // If there is only one choice for billing account, automatically select it for the user.
        if (this.authorizedBillingAccounts
            && Array.isArray(this.authorizedBillingAccounts)
            && this.authorizedBillingAccounts.length === 1
            && this.form.get("selectAccount")
            && (this._showBilling_previousValue === false && newValue === true)) {

            this.form.get("selectAccount").setValue(this.authorizedBillingAccounts[0]);
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


    constructor(private dictionaryService: DictionaryService,
                private router: Router,
                private fb: FormBuilder,
                private billingService: BillingService,
                private getLabService: GetLabService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private gnomexService: GnomexService,
                private newExperimentService: NewExperimentService,
                private experimentService: ExperimentsService,
                private route: ActivatedRoute,) {
        // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.navigationSubscription = this.router.events.subscribe((e: any) => {
            // If it is a NavigationEnd event re-initalise the component
            if (e instanceof NavigationEnd) {
                this.reinitialize();
            }
        });
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

    ngOnInit() {
        this.sub = this.route.params.subscribe((params: any) => {

            this.requestCategories = [];
            this.newExperimentService.components = [];
            this.newExperimentService.organisms = [];
            this.newExperimentService.componentRefs = [];
            this.newExperimentService.samplesGridRowData = [];
            this.newExperimentService.currentComponent = null;

            if (params && params.idCoreFacility) {
                this.newExperimentService.idCoreFacility = params.idCoreFacility;
                this.coreFacility = this.dictionaryService.getEntry('hci.gnomex.model.CoreFacility', this.newExperimentService.idCoreFacility);

                if (!!this.coreFacility) {
                    this.label = "New Experiment for " + this.coreFacility.display;
                }

                this.requestCategories = this.getFilteredRequestCategories().sort(this.sortRequestCategory);

                this.experimentService.getNewRequest().subscribe((response: any) => {

                    if (!response) {
                        return;
                    }

                    this.newExperimentService.request = response.Request;

                    if (!this.gnomexService.isInternalExperimentSubmission) {
                        this.addDescriptionFieldToAnnotations(this.newExperimentService.request.PropertyEntries);
                    }

                    // this.newExperimentService.buildPropertiesByUser();
                    this.newExperimentService.propertyEntries = this.newExperimentService.request.PropertyEntries;
                    this.annotations = this.newExperimentService.request.RequestProperties;
                    this.annotations = this.annotations.filter(annotation =>
                        annotation.isActive === 'Y' && annotation.idCoreFacility === this.newExperimentService.idCoreFacility
                    );
                    this.newExperimentService.annotations = this.annotations;
                    this.annotationInputs.annotations = this.annotations;
                });

                this.labList = this.gnomexService.labList.filter((lab) => {
                    return lab.canGuestSubmit === 'Y' || lab.canSubmitRequests === 'Y';
                });

                this.form = this.fb.group({
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
                this.nextButtonIndex = 1;
                this.newExperimentService.currentComponent = this;
                this.newExperimentService.components.push(this);
                this.newExperimentService.setupView = this;
            }
        });
    }

    ngOnDestroy() {
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
        if (this.submittersSubscription) {
            this.submittersSubscription.unsubscribe();
        }
    }


    private addDescriptionFieldToAnnotations(props: any[]): void {
        let descNode: any = {
            PropertyEntry: {
                idProperty: "-1",
                name: "Description",
                otherLabel: "",
                Description: "false",
                isActive: "Y"
            }
        };
        props.splice(1, 0, descNode);
    }

    onCategoryChange(event) {
        this.icon = event.value.icon;

        if (this.form && this.form.get("selectedCategory")) {
            this.newExperimentService.category = this.form.get("selectedCategory").value;

            let code = this.form.get("selectedCategory").value;

            // Special code for CLINSEQ request from BST.
            if (code == null && this.defaultCodeRequestCategory != null) {
                code = this.defaultCodeRequestCategory;
            }

            this.newExperimentService.requestCategory = this.dictionaryService.getEntry('hci.gnomex.model.RequestCategory', code.value);

            if (this.newExperimentService.requestCategory) {
                this.label = "New " + this.newExperimentService.requestCategory.display + " Experiment for " + this.coreFacility.display;

                this.workAuthLabel   = this.gnomexService.getCoreFacilityProperty(this.newExperimentService.requestCategory.idCoreFacility, this.gnomexService.PROPERTY_REQUEST_WORK_AUTH_LINK_TEXT);
                this.accessAuthLabel = this.gnomexService.getCoreFacilityProperty(this.newExperimentService.requestCategory.idCoreFacility, this.gnomexService.PROPERTY_ACCESS_AUTH_ACCOUNT_LINK_TEXT);
            }
        }

        this.showTabs();
    }

    showTabs() {
        this.tabs = [];
        let category = this.newExperimentService.requestCategory;
        this.inputs.requestCategory = category;
        this.newExperimentService.request.applicationNotes = '';
        this.newExperimentService.request.codeApplication = '';
        this.newExperimentService.request.codeIsolationPrepType = '';
        this.newExperimentService.request.coreToExtractDNA = 'N';
        this.newExperimentService.request.includeBisulfideConversion = 'N';
        this.newExperimentService.request.includeQubitConcentration = 'N';

        if (category.isIlluminaType === 'Y') {
            this.gnomexService.submitInternalExperiment()
                ? this.newExperimentService.currentState.next('SolexaBaseState')
                : this.newExperimentService.currentState.next('SolexaBaseExternalState');

            let propertyTab = {
                label: "Other Details",
                disabled: true,
                component: AnnotationTabComponent
            };
            let sampleSetupTab = {
                label: "Sample Details",
                disabled: true,
                component: TabSampleSetupViewComponent
            };
            let libPrepTab = {
                label: "Library Prep",
                disabled: true,
                component: TabSeqSetupViewComponent
            };
            let seqProtoTab = {
                label: "Seq Options",
                disabled: true,
                component: TabSeqProtoViewComponent
            };
            let annotationsTab = {
                label: "Annotations",
                disabled: true,
                component: TabAnnotationViewComponent
            };
            let samplesTab = {
                label: "Experiment Design",
                disabled: true,
                component: TabSamplesIlluminaComponent
            };
            let visibilityTab = {
                label: "Visibility",
                disabled: true,
                component: VisibilityDetailTabComponent
            };
            let bioTab = {
                label: "Bioinformatics",
                disabled: true,
                component: TabBioinformaticsViewComponent
            };
            let confirmTab = {
                label: "Confirm",
                disabled: true,
                component: TabConfirmIlluminaComponent
            };
            this.tabs.push(sampleSetupTab);
            this.tabs.push(propertyTab);
            this.tabs.push(libPrepTab);
            this.tabs.push(seqProtoTab);
            this.tabs.push(annotationsTab);
            this.tabs.push(samplesTab);
            this.tabs.push(visibilityTab);
            this.tabs.push(bioTab);
            this.tabs.push(confirmTab);
            this.numTabs = 10;
        } else if (category.type === this.newExperimentService.TYPE_QC) {
            this.gnomexService.submitInternalExperiment() ? this.newExperimentService.currentState.next('QCState') :
                this.newExperimentService.currentState.next('QCExternalState');
            let sampleSetupTab = {
                label: "Sample Details",
                disabled: true,
                component: TabSampleSetupViewComponent
            };
            let visibilityTab = {
                label: "Visibility",
                disabled: true,
                component: VisibilityDetailTabComponent
            };
            this.tabs.push(sampleSetupTab);
            this.tabs.push(visibilityTab);
        } else if (category.type === this.newExperimentService.TYPE_GENERIC) {
            this.gnomexService.submitInternalExperiment() ? this.newExperimentService.currentState.next('GenericState') :
                this.newExperimentService.currentState.next('GenericExternalState');
        } else if (category.type === this.newExperimentService.TYPE_CAP_SEQ) {
            this.newExperimentService.currentState.next("CapSeqState");
        } else if (category.type === this.newExperimentService.TYPE_FRAG_ANAL) {
            this.newExperimentService.currentState.next("FragAnalState");
        } else if (category.type === this.newExperimentService.TYPE_MIT_SEQ) {
            this.newExperimentService.currentState.next("MitSeqState");
        } else if (category.type === this.newExperimentService.TYPE_CHERRY_PICK) {
            this.newExperimentService.currentState.next("CherryPickState");
        } else if (category.type === this.newExperimentService.TYPE_ISCAN) {
            this.newExperimentService.currentState.next("IScanState");
        } else if (category.type === this.newExperimentService.TYPE_SEQUENOM) {
            this.newExperimentService.currentState.next("SequenomState");
        } else if (category.type === this.newExperimentService.TYPE_ISOLATION) {
            this.newExperimentService.currentState.next("IsolationState");
        } else if (category.type === this.newExperimentService.TYPE_NANOSTRING) {
            this.newExperimentService.currentState.next("NanoStringState");
        } else if (category.type === this.newExperimentService.TYPE_CLINICAL_SEQUENOM) {
            this.newExperimentService.currentState.next("ClinicalSequenomState");
        } else if (category.type === this.newExperimentService.TYPE_MICROARRAY) {
            this.gnomexService.submitInternalExperiment()
                ? this.newExperimentService.currentState.next('MicroarrayState')
                : this.newExperimentService.currentState.next('MicroarrayExternalState');
        }
    }

    onTabChange(event) {
        event.tab.nextEnabled = true;
        if (this.newExperimentService.samplesGridApi) {
            this.newExperimentService.samplesGridApi.sizeColumnsToFit();
            this.newExperimentService.samplesGridApi.setColumnDefs(this.newExperimentService.samplesGridColumnDefs);
        }
        this.newExperimentService.selectedIndex = event.index;
        if (event.tab.textLabel === "Confirm") {
            this.newExperimentService.onConfirmTab.next(true);
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

    public selectLabOption(event: any) {
        if (event && event.source && event.source.selected == true) {
            let value = event.source.value;
            this.filteredProjectList = this.gnomexService.projectList;

            if (!value.idLab) {
                return;
            }
            if (this.currentIdLab !== value.idLab) {
                this.currentIdLab = value.idLab;

                this.form.get("selectName").setValue("");
                this.form.markAsPristine();

                this.possibleSubmitters = [];
                this.possibleSubmitters_loaded = false;
                if (!this.submittersSubscription) {
                    this.submittersSubscription = this.getLabService.getSubmittersForLab(value.idLab, 'Y', 'N').subscribe((submitters: any[]) => {
                        if (submitters) {
                            this.possibleSubmitters = submitters.filter((a) => {
                                return a && a.isActive && a.isActive === 'Y';
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

            this.newExperimentService.lab = event.source.value;
            this.newExperimentService.getHiSeqPriceList();
            this.newExperimentService.request.idLab = this.newExperimentService.lab.idLab;
        }
    }


    public displayLab(lab: any) {
        return lab ? lab.name : lab;
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

    public onUserSelection(event) {
        if (this.form.get('selectName') && this.form.get('selectName').value) {
            this.newExperimentService.experimentOwner = this.form.get('selectName').value;
            this.newExperimentService.request.idAppUser = this.newExperimentService.idAppUser;
            this.newExperimentService.request.idOwner = this.newExperimentService.experimentOwner.idAppUser;
            this.newExperimentService.request.idLab = this.newExperimentService.lab.idLab;
            this.visibilityDetailObj.currentOrder = this.newExperimentService.request;
            this.visibilityDetailObj.ngOnInit();
        }
    }

    refreshBillingAccounts() {
        this.checkForOtherAccounts();
        this.newExperimentService.idAppUser = this.securityAdvisor.idAppUser.toString();

        let cat = this.newExperimentService.requestCategory;
        if (!Array.isArray(this.authorizedBillingAccounts)) {
            this.authorizedBillingAccounts = [this.authorizedBillingAccounts.BillingAccount];
        }
        this.authorizedBillingAccounts = this.authorizedBillingAccounts.filter(account => {
            return account.overrideFilter === 'Y' || (cat.idCoreFacility && account.idCoreFacility === cat.idCoreFacility);
        });

        this.selectDefaultUserProject();
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
            this.newExperimentService.idAppUser = this.form.controls['selectName'].value != null && this.form.controls['selectName'].value.idAppUser != '' ? this.form.controls['selectName'].value.idAppUser : '';

        } else if (this.gnomexService.hasPermission('canSubmitForOtherCores') && iCanSubmitToThisCoreFacility) {
            this.adminState = "AdminState";
            this.newExperimentService.idAppUser = this.form.controls['selectName'].value != null && this.form.controls['selectName'].value.idAppUser != '' ? this.form.controls['selectName'].value.idAppUser : '';
        } else {
            if (this.gnomexService.submitInternalExperiment()) {
                this.adminState = "";
            } else {
                this.adminState = "ExternalExperimentState";
            }
            this.newExperimentService.idAppUser = this.securityAdvisor.idAppUser.toString();
        }

        this.checkForOtherAccounts();

        this.workAuthInstructions = this.gnomexService.getProperty(this.gnomexService.PROPERTY_WORKAUTH_INSTRUCTIONS);
        this.accessAuthorizedBillingAccountInstructions = this.gnomexService.getProperty(this.gnomexService.PROPERTY_AUTH_ACCOUNTS_DESCRIPTION);

    }

    checkForOtherAccounts(): void {
        if (this.securityAdvisor.isAdmin || this.securityAdvisor.isBillingAdmin || this.securityAdvisor.isSuperAdmin) {
            this.showAccessAuthorizedAccountsLink = true;
            let authorizedBillingAccountsParams: HttpParams = new HttpParams().set("idCoreFacility", this.newExperimentService.idCoreFacility);

            this.billingService.getAuthorizedBillingAccounts(authorizedBillingAccountsParams).subscribe((response: any) => {
                this.showAccessAuthorizedAccountsLink = response && response.hasAccountsWithinCore && response.hasAccountsWithinCore === 'Y';
            });
        } else if (this.newExperimentService.idAppUser != null && this.newExperimentService.idAppUser != '') {
            let idCoreFacility: string = this.newExperimentService.idCoreFacility;
        }

    }


    chooseFirstLabOption(): void {
        this.autoLabComplete.options.first.select();
    }

    onProjectSelection(event) {
    }

    onBillingSelection(event) {
        this.newExperimentService.billingAccount = this.form.get("selectAccount").value;
        this.disableNext = false;
        this.getFilteredApps();
    }

    getFilteredApps() {
        // this.newExperimentService.filteredApps = this.newExperimentService.filterApplication(this.requestCategory, !this.showPool);
        this.newExperimentService.filteredApps = this.newExperimentService.filterApplication(this.newExperimentService.requestCategory, !this.showPool);
    }

    selectDefaultUserProject(): void {
        // Default the project dropdown to the the project owned by the user
        if (!this.securityAdvisor.isAdmin && !this.securityAdvisor.isSuperAdmin) {
            this.form.controls['selectName'].setErrors(null);
            if (this.newExperimentService.idAppUser != null) {
                for (let project of this.filteredProjectList) {
                    if (project.idAppUser === this.newExperimentService.idAppUser) {
                        this.form.get('selectProject').setValue(project);
                        this.newExperimentService.project = this.form.get('selectProject').value;
                        break;
                    }
                }
            }
        } else {
            this.form.get('selectProject').setValue(this.filteredProjectList[0]);
            this.newExperimentService.project = this.form.get('selectProject').value;
        }

        if (this.newExperimentService.project) {
            this.newExperimentService.request.idProject = this.newExperimentService.project.idProject;
        }
    }

    goBack() {
        this.newExperimentService.selectedIndex--;
        this.newExperimentService.currentComponent = this.newExperimentService.components[this.newExperimentService.selectedIndex]
    }

    goNext() {
        switch (this.newExperimentService.currentState.value) {
            case 'SolexaBaseState' : {
                if (this.newExperimentService.selectedIndex === 0) {
                    this.tabs[0].disabled = false;
                    this.tabs[1].disabled = false;
                } else if (this.newExperimentService.selectedIndex === 1) {
                    this.tabs[2].disabled = false;
                } else if (this.newExperimentService.selectedIndex === 2) {
                    this.tabs[3].disabled = false;
                } else if (this.newExperimentService.selectedIndex === 3) {
                    this.tabs[4].disabled = false;
                } else if (this.newExperimentService.selectedIndex === 4) {
                    this.tabs[5].disabled = false;
                } else if (this.newExperimentService.selectedIndex === 5) {
                    this.tabs[6].disabled = false;
                } else if (this.newExperimentService.selectedIndex === 6) {
                    this.tabs[7].disabled = false;
                } else if (this.newExperimentService.selectedIndex === 7) {
                    this.tabs[8].disabled = false;
                } else if (this.newExperimentService.selectedIndex === 8) {
                    this.newExperimentService.hideSubmit = false;
                    this.newExperimentService.disableSubmit = true;
                }
                break;
            }
            case 'QCState' : {
                if (this.newExperimentService.selectedIndex === 0) {
                    this.tabs[0].disabled = false;
                }
            }

        }
        this.newExperimentService.selectedIndex++;
        this.newExperimentService.currentComponent = this.newExperimentService.components[this.newExperimentService.selectedIndex];

        // TODO: revisit
        // was getting error
        if (this.newExperimentService.currentComponent.form) {
            this.newExperimentService.currentComponent.form.markAsPristine();
        }

        Object.keys(this.form.controls).forEach((key: string) => {
            this.form.controls[key].markAsPristine();
        });
    }

    destroyComponents() {
        for (let component of this.newExperimentService.componentRefs) {
            component.destroy();
        }
    }

    onNewAccount() {

    }

    componentCreated(compRef: ComponentRef<any>) {
        if (compRef) {
            this.newExperimentService.components.push(compRef.instance);
            if (compRef.instance instanceof VisibilityDetailTabComponent) {
                this.visibilityDetailObj = compRef.instance as VisibilityDetailTabComponent;
            } else if (compRef.instance instanceof TabSampleSetupViewComponent) {
            }
            this.newExperimentService.componentRefs.push(compRef);
        }
    }

    sortRequestCategory(obj1: any, obj2: any): number {
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

    public clickCancel(): void {
        console.log("Cancel clicked!");
    }
}


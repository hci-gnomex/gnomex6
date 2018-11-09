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
import {TabPropertiesViewComponent} from "./tab-properties-view.component";
import {BehaviorSubject, Subscription} from "rxjs";
import {TabBioinformaticsViewComponent} from "./tab-bioinformatics-view.component";
import {TabConfirmIlluminaComponent} from "./tab-confirm-illumina.component";
import {VisibilityDetailTabComponent} from "../../util/visibility-detail-tab.component";
import {Observable} from "rxjs/Observable";

@Component({
    selector: 'new-experiment',
    templateUrl: "./new-experiment.component.html",
    styles: [`
                
        li { margin-bottom: 1.5em; }
        
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


        .inline-block { display: inline-block; }
        
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
        
        
        
        


        .mat-button.mat-small {
            min-width: 1%;
        }

        .category-margin {
            margin-top: .5em;
            margin-bottom: .5em
        }

        .billing-instructions {
            font-style: italic;
        }

        .link-button {
            font-size: small;
            text-decoration: underline;
            color: blue
        }

        mat-radio-button.radioOption {
            margin: 0 0.25rem;
        }

        /deep/ .mat-radio-button.mat-accent .mat-radio-label {
            font-size: .75rem;
            margin-right: 1em;
        }

        /deep/ .mat-radio-button.mat-accent .mat-radio-label .mat-radio-container .mat-radio-inner-circle {
            height: 15px;
            width: 15px;
        }

        /deep/ .mat-radio-button.mat-accent .mat-radio-label .mat-radio-container .mat-radio-outer-circle {
            height: 15px;
            width: 15px;
        }

    `]

})

export class NewExperimentComponent implements OnDestroy, OnInit {
    @ViewChild("autoLab") autoLabComplete: MatAutocomplete;
    @Output() properties = new EventEmitter<any[]>();

    // tabs: any[] = [];
    types = OrderType;
    private selectedCategory: any;
    private categories: any[] = [];
    private requestCategories: any[] = [];
    private filteredProjectList: any[] = [];
    private priceMap: Map<string, string> = new Map<string, string>();
    themeMap: Map<string, any> = new Map<string, any>();
    themes: any[] = [];
    private requestCategoriesExternal: any[] = [];
    private authorizedBillingAccounts: any;
    public appPrices: any[] = [];
    private coreFacility: any;
    private sub: any;

    public label: string = "New Experiment Order for ";

    private icon: any;
    private form: FormGroup;
    private currentIdLab: string;
    private labList: Array<any>;

    // private showProject: boolean = false;
    // private showBilling: boolean = false;
    // private showNameDesc: boolean = false;
    private showAccessAuthorizedAccountsLink: boolean = false;
    private defaultCodeRequestCategory: any = null;
    private requestCategory: any;
    private codeRequestCategory: any;
    private selectedIndex: number = 0;
    private nextButtonIndex: number = -1;
    private adminState: string;
    private workAuthInstructions: string;
    private accessAuthorizedBillingAccountInstructions: string;
    private workAuthLabel: string;
    private accessAuthLabel: string;
    private annotations: any;
    private disableNext: boolean = true;
    navigationSubscription: Subscription;
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


    public get showLab(): boolean {
        return !!(this.form.get("selectedCategory").value)
            || !this.gnomexService.submitInternalExperiment();
    }
    public get showName(): boolean {
        return this.showLab
            && this.form
            && this.form.get('selectLab')
            && this.form.get('selectLab').valid
            && this.possibleSubmitters
            && this.possibleSubmitters.length > 0;
    }
    public get showBilling(): boolean {
        return this.showName
            && this.form
            && this.form.get('selectName')
            && this.form.get('selectName').valid;
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
                // this.initialize();
            }
        });
    }

    ngOnInit() {
        this.sub = this.route.queryParams.subscribe((params: any) => {
            if (params && params.id) {
                this.initialize();
                for (let category of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.RequestCategory")) {
                    this.categories.push(category);
                }
                this.requestCategories = this.categories.filter(category =>
                    category.isActive === 'Y' && category.isInternal === 'Y'
                );
                this.requestCategoriesExternal = this.categories.filter(category =>
                    category.isActive === 'Y' && category.isExternal === 'Y'
                );
                this.newExperimentService.idCoreFacility = params.id;
                this.coreFacility = this.dictionaryService.getEntry('hci.gnomex.model.CoreFacility', this.newExperimentService.idCoreFacility);

                if (!!this.coreFacility) {
                    this.label = "New Experiment for " + this.coreFacility.display;
                }

                this.requestCategories = this.filterRequestCategories(this.requestCategories);
                this.requestCategories.sort(this.sortRequestCategory);
                this.newExperimentService.expTypeLabel = this.newExperimentService.expTypeLabel.concat(this.coreFacility.facilityName);
                this.experimentService.getNewRequest().subscribe((response: any) => {
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
                this.labList = this.gnomexService.labList
                    .filter(lab => lab.canGuestSubmit === 'Y' || lab.canSubmitRequests === 'Y');

                this.form = this.fb.group({
                    selectedCategory: ['', Validators.required],
                    selectLab: ['', Validators.required],
                    selectName: ['', Validators.required],
                    selectProject: ['', Validators.required],
                    selectAccount: ['', Validators.required],
                    experimentName: [''],
                    description: ["", Validators.maxLength(5000)]
                });

                this.filteredProjectList = this.gnomexService.projectList;
                this.checkSecurity();
                this.setVisibility();
                this.nextButtonIndex = 1;
                this.newExperimentService.currentComponent = this;
                this.newExperimentService.components.push(this);
                this.newExperimentService.setupView = this;
                // this.newExperimentService.filterPropertiesByUser(this.);

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

    initialize() {
        this.categories = [];
        this.requestCategories = [];
        this.requestCategoriesExternal = [];
        this.newExperimentService.components = [];
        this.newExperimentService.organisms = [];
        this.newExperimentService.componentRefs = [];
        this.newExperimentService.samplesGridRowData = [];
        this.newExperimentService.currentComponent = null;
        this.newExperimentService.expTypeLabel = "";
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

    public selectCategory(event: any) {
        this.label = "New " + " Experiment for " + this.coreFacility.display;
    }

    onCategoryChange(event) {
        this.icon = event.value.icon;
        this.setVisibility();
        this.showTabs();
        this.newExperimentService.category = this.form.get("selectedCategory").value;
        this.newExperimentService.expTypeLabel = "New " + this.newExperimentService.category.display + " Experiment For " + this.coreFacility.facilityName;
    }

    showTabs() {
        this.newExperimentService.tabs = [];
        let category = this.getRequestCategory();
        this.inputs.requestCategory = category;
        this.newExperimentService.request.applicationNotes = '';
        this.newExperimentService.request.codeApplication = '';
        this.newExperimentService.request.codeIsolationPrepType = '';
        this.newExperimentService.request.coreToExtractDNA = 'N';
        this.newExperimentService.request.includeBisulfideConversion = 'N';
        this.newExperimentService.request.includeQubitConcentration = 'N';

        if (category.isIlluminaType === 'Y') {
            this.gnomexService.submitInternalExperiment() ? this.newExperimentService.currentState.next('SolexaBaseState') :
                this.newExperimentService.currentState.next('SolexaBaseExternalState');
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
            this.newExperimentService.tabs.push(sampleSetupTab);
            this.newExperimentService.tabs.push(propertyTab);
            this.newExperimentService.tabs.push(libPrepTab);
            this.newExperimentService.tabs.push(seqProtoTab);
            this.newExperimentService.tabs.push(annotationsTab);
            this.newExperimentService.tabs.push(samplesTab);
            this.newExperimentService.tabs.push(visibilityTab);
            this.newExperimentService.tabs.push(bioTab);
            this.newExperimentService.tabs.push(confirmTab);
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
            this.newExperimentService.tabs.push(sampleSetupTab);
            this.newExperimentService.tabs.push(visibilityTab);
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
            this.gnomexService.submitInternalExperiment() ? this.newExperimentService.currentState.next('MicroarrayState') :
                this.newExperimentService.currentState.next('MicroarrayExternalState');
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

    filterRequestCategories(categories: any[]): any[] {
        let keep: Boolean = false;
        let requestCategories: any[] = [];
        for (let category of categories) {
            if (this.coreFacility) {
                if (category.codeRequestCategory === this.coreFacility.codeRequestCategory) {
                    requestCategories.push(category);
                } else if (category.isClinicalResearch == null || category.isClinicalResearch != 'Y') {
                    if (category.idCoreFacility === this.coreFacility.idCoreFacility) {
                        requestCategories.push(category);
                    }
                }
            }
        }
        return requestCategories;
    }

    public selectLabOption(event: any) {
        if (event && event.source) {
            this.form.get("selectName").setValue("");
            this.possibleSubmitters = [];
        }

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
                let temp: Observable<any[]> = this.getLabService.getSubmittersForLab(value.idLab, 'Y', 'N');
                if (!this.submittersSubscription) {
                    this.submittersSubscription = temp.subscribe((submitters: any[]) => {
                        if (submitters) {
                            this.possibleSubmitters = submitters.filter((a) => {
                                return a && a.isActive && a.isActive === 'Y';
                            });
                        } else {
                            this.possibleSubmitters = [];
                        }
                    });
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


    displayLab(lab: any) {
        return lab ? lab.name : lab;
    }

    filterLabList(selectedLab: any) {
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

    onUserSelection(event) {
        if (this.form.get('selectName')) {
            this.newExperimentService.experimentOwner = this.form.get('selectName').value;
            this.setVisibility();
            this.newExperimentService.request.idAppUser = this.newExperimentService.idAppUser;
            this.newExperimentService.request.idOwner = this.newExperimentService.experimentOwner.idAppUser;
            this.newExperimentService.request.idLab = this.newExperimentService.lab.idLab;
            this.visibilityDetailObj.currentOrder = this.newExperimentService.request;
            this.visibilityDetailObj.ngOnInit();
        }
    }

    indexEventHandler(event) {
        if (event === '+') {
            this.nextButtonIndex++;
        } else {
            this.nextButtonIndex--;
        }
    }

    refreshBillingAccounts() {
        this.checkForOtherAccounts();
        // If not admin then show project and billing since onOwner is not shown
        // if (!this.securityAdvisor.isAdmin && !this.securityAdvisor.isSuperAdmin) {
        //     this.showProject = true;
        //     // this.showBilling = true;
        // }
        this.newExperimentService.idAppUser = this.securityAdvisor.idAppUser.toString();

        let cat = this.getRequestCategory();
        if (!Array.isArray(this.authorizedBillingAccounts)) {
            this.authorizedBillingAccounts = [this.authorizedBillingAccounts.BillingAccount];
        }
        this.authorizedBillingAccounts = this.authorizedBillingAccounts.filter(account => {
            return account.overrideFilter === 'Y' || (cat.idCoreFacility && account.idCoreFacility === cat.idCoreFacility);
        });

        this.selectDefaultUserProject();
        this.setVisibility();
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
            // if (this.authorizedBillingAccounts == null || authAccountParamsChange(idAppUser, idCoreFacility)) {
            //     this.showAccessAuthorizedAccountsLink = false;
            //     updateAuthAccountsParams(null, null);
            //
            //     let params2:Object = new Object();
            //     params2.idAppUser = idAppUser;
            //     if (idCoreFacility != null) {
            //         params2.idCoreFacility = idCoreFacility;
            //     }
            //
            //     getAuthorizedBillingAccounts.send(params2);
            //
            //     updateAuthAccountsParams(idAppUser, idCoreFacility);
            // }
        }

    }

    setVisibility(): void {
        let visible: boolean = true;
        // if (!this.form.get("selectedCategory").value) {
        //     visible = !this.gnomexService.submitInternalExperiment();
        // }
        // this.showLab = visible;
        //
        // if (this.form.get("selectLab").value === null) {
        //     visible = !this.gnomexService.submitInternalExperiment();
        // }
        // if (!this.newExperimentService.idAppUser) {
        //     visible = !this.gnomexService.submitInternalExperiment();
        // }
        // this.showBilling = visible;

        if (this.authorizedBillingAccounts
            && Array.isArray(this.authorizedBillingAccounts)
            && this.authorizedBillingAccounts.length === 1
            && this.form.get("selectAccount")
            && !this.form.get("selectAccount").value) {

            this.form.get("selectAccount").setValue(this.authorizedBillingAccounts[0]);
        }

        if (this.form.get("selectedCategory").value && this.getRequestCategory()) {
            this.workAuthLabel = this.gnomexService.getCoreFacilityProperty(this.getRequestCategory().idCoreFacility, this.gnomexService.PROPERTY_REQUEST_WORK_AUTH_LINK_TEXT);
            this.accessAuthLabel = this.gnomexService.getCoreFacilityProperty(this.getRequestCategory().idCoreFacility, this.gnomexService.PROPERTY_ACCESS_AUTH_ACCOUNT_LINK_TEXT);
        }
        // if (!this.form.get("selectAccount").value) {
        //     visible = !this.gnomexService.submitInternalExperiment();
        // }
        // this.showProject = visible;
        // this.showNameDesc = visible;
    }

    getIdCoreFacility(): string {
        //TODO Need to handle CLINSEQ TYPES
        let cat = this.requestCategory;
        let idCoreFacility: string = null;
        if (cat != null && cat.idCoreFacility.toString() != '') {
            idCoreFacility = cat.idCoreFacility.toString();
        }
        return idCoreFacility;
    }

    getRequestCategory(): any {
        let code = this.form.get("selectedCategory").value;

        // Special code for CLINSEQ request from BST.
        if (code == null && this.defaultCodeRequestCategory != null) {
            code = this.defaultCodeRequestCategory;
        }
        this.requestCategory = this.dictionaryService.getEntry('hci.gnomex.model.RequestCategory', code.value);
        if (!this.newExperimentService.requestCategory) {
            this.newExperimentService.requestCategory = this.requestCategory;
        }
        this.codeRequestCategory = this.requestCategory.codeRequestCategory;
        return this.requestCategory;
    }


    chooseFirstLabOption(): void {
        this.autoLabComplete.options.first.select();
    }

    onProjectSelection(event) {
    }

    onBillingSelection(event) {
        this.newExperimentService.billingAccount = this.form.get("selectAccount").value;
        this.setVisibility();
        this.disableNext = false;
        this.getFilteredApps();
    }

    getFilteredApps() {
        this.newExperimentService.filteredApps = this.newExperimentService.filterApplication(this.requestCategory, !this.showPool);
    }

    incrementNext() {
        this.nextButtonIndex++;
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
                    this.newExperimentService.tabs[0].disabled = false;
                    this.newExperimentService.tabs[1].disabled = false;
                } else if (this.newExperimentService.selectedIndex === 1) {
                    this.newExperimentService.tabs[2].disabled = false;
                } else if (this.newExperimentService.selectedIndex === 2) {
                    this.newExperimentService.tabs[3].disabled = false;
                } else if (this.newExperimentService.selectedIndex === 3) {
                    this.newExperimentService.tabs[4].disabled = false;
                } else if (this.newExperimentService.selectedIndex === 4) {
                    this.newExperimentService.tabs[5].disabled = false;
                } else if (this.newExperimentService.selectedIndex === 5) {
                    this.newExperimentService.tabs[6].disabled = false;
                } else if (this.newExperimentService.selectedIndex === 6) {
                    this.newExperimentService.tabs[7].disabled = false;
                } else if (this.newExperimentService.selectedIndex === 7) {
                    this.newExperimentService.tabs[8].disabled = false;
                } else if (this.newExperimentService.selectedIndex === 8) {
                    this.newExperimentService.hideSubmit = false;
                    this.newExperimentService.disableSubmit = true;
                }
                break;
            }
            case 'QCState' : {
                if (this.newExperimentService.selectedIndex === 0) {
                    this.newExperimentService.tabs[0].disabled = false;
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


import {
    Component, ViewChild, ComponentRef, OnDestroy, OnInit
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
import {TabSeqSetupView} from "./tab-seq-setup-view";
import {AnnotationTabComponent, OrderType} from "../../util/annotation-tab.component";
import {TabSeqProtoView} from "./tab-seq-proto-view";

@Component({
    selector: 'tabs',
    templateUrl: "./new-experiment.html",
    styles: [`
        .flex-column-container {
            display: flex;
            flex-direction: column;
        }
        .flex-row-container {
            display: flex;
            flex-direction: row;
        }
        .row-one {
            display: flex;
            flex-grow: 1;
        }
        .cat-type-radio-group {
            display: inline-flex;
            flex-direction: column;
            margin-left: 5em;
        }
        .mat-button.mat-small {
            min-width: 1%;
        }
        mat-form-field.formField {
            width: 30%;
            margin: 0 0.5em;
        }
        .flexbox-column{
            display:flex;
            flex-direction:column;
            height:100%;
            width:100%;
        }
        .flex-container{
            display: flex;
            margin-top: 1em;
            padding-left: 1em;
        }
        .inline-span {
            width: 20em;
            display: inline-block;
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
    tabs: any[] = [];
    types = OrderType;
    private selectedCategory: any;
    private categories: any[] = [];
    private requestCategories: any[] = [];
    private filteredProjectList: any[] = [];
    private requestCategoriesExternal: any[] = [];
    private authorizedBillingAccounts: any[] = [];
    private coreFacility: any;
    private idAppUser: string;
    private idCoreFacility: string;
    private sub: any;
    private label: string = "New Experiment Order for ";
    private icon: any;
    private form: FormGroup;
    private currentIdLab: string;
    private labList: Array<any>;
    private showLab: boolean = false;
    private showProject: boolean = false;
    private showBilling: boolean = false;
    private showNameDesc: boolean = false;
    private showAccessAuthorizedAccountsLink: boolean = false;
    private defaultCodeRequestCategory: any = null;
    private requestCategory: any;
    private codeRequestCategory: any;
    private selectedIndex: number = 0;
    private nextButtonIndex: number = -1;
    private adminState: string;
    private workAuthInstructions: string;
    private accessAuthorizedBillingAccountInstructions: string;
    private setupView: boolean = true;
    private workAuthLabel: string;
    private accessAuthLabel: string;
    private request: any;
    private annotations: any;
    private disableNext: boolean = true;
    private componentRefs: any[] = [];
    private currentComponent: any;

    inputs = {
        requestCategory: null
    };

    annotationInputs = {
        annotations: this.annotations,
        orderType: this.types.EXPERIMENT,
        disabled: false
    };

    constructor(private dictionaryService: DictionaryService,
                private router: Router,
                private fb: FormBuilder,
                private billingService: BillingService,
                private getLabService: GetLabService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private gnomexService: GnomexService,
                private newExperimentService: NewExperimentService,
                private experimentService: ExperimentsService,
                private route: ActivatedRoute,
                ) {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    }

    ngOnInit() {
        for (let category of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.RequestCategory")) {
            this.categories.push(category);
        }
        this.requestCategories = this.categories.filter(category =>
            category.isActive === 'Y' && category.isInternal === 'Y'
        );
        this.requestCategoriesExternal = this.categories.filter(category =>
            category.isActive === 'Y' && category.isExternal === 'Y'
        );
        this.sub = this.route
            .queryParams
            .subscribe(params => {
                this.idCoreFacility = params.id;
                this.coreFacility = this.dictionaryService.getEntry('hci.gnomex.model.CoreFacility', this.idCoreFacility);
                this.requestCategories = this.filterRequestCategories(this.requestCategories);
                this.requestCategories.sort(this.sortRequestCategory);
                this.label = this.label.concat(this.coreFacility.facilityName);
                this.experimentService.getNewRequest().subscribe((response: any) => {
                    this.request = response.Request;
                    this.annotations = this.request.RequestProperties;
                    this.annotations = this.annotations.filter(annotation =>
                        annotation.isActive === 'Y' && annotation.idCoreFacility === this.idCoreFacility
                    )
                    this.newExperimentService.annotations = this.annotations;
                    this.annotationInputs.annotations = this.annotations;
                });
            });

        this.labList = this.gnomexService.labList
            .filter(lab => lab.canGuestSubmit === 'Y' || lab.canSubmitRequests == 'Y');

        this.form = this.fb.group({
            selectedCategory: ['', Validators.required],
            selectLab: ['', Validators.required],
            selectOwner: ['', Validators.required],
            selectProject: ['', Validators.required],
            selectAccount: ['', Validators.required],
            experimentName: [''],
            description: ["", Validators.maxLength(5000)]
        });

        this.filteredProjectList = this.gnomexService.projectList;
        this.checkSecurity();
        this.setVisibility();
        this.nextButtonIndex = 1;
        this.currentComponent = this;
        this.componentRefs.push(this);
    }

    selectCategory(event) {
    }

    onCategoryChange(event) {
        this.icon = event.value.icon;
        this.setVisibility();
        this.showTabs();
        this.newExperimentService.category = this.form.get("selectedCategory").value;
    }

    showTabs() {
        let category = this.getRequestCategory();
        this.inputs.requestCategory = category;
        if (category.isIlluminaType === 'Y') {
            this.gnomexService.submitInternalExperiment() ? this.newExperimentService.currentState.next('SolexaBaseState') :
                this.newExperimentService.currentState.next('SolexaBaseExternalState');
            let props = {label: "Other Details", disabled: true, component: AnnotationTabComponent};
            let samplesetup = {label: "Sample Details", disabled: true, component: TabSampleSetupViewComponent};
            let libPrep = {label: "Library Prep", disabled: true, component: TabSeqSetupView};
            let seqProto = {label: "Seq Options", disabled: true, component: TabSeqProtoView};
            this.tabs.push(samplesetup);
            this.tabs.push(props);
            this.tabs.push(libPrep);
            this.tabs.push(seqProto);
        } else if (category.type === this.newExperimentService.TYPE_QC) {
            this.gnomexService.submitInternalExperiment() ? this.newExperimentService.currentState.next('QCState') :
                this.newExperimentService.currentState.next('QCExternalState');
        } else if (category.type == this.newExperimentService.TYPE_GENERIC) {
            this.gnomexService.submitInternalExperiment() ? this.newExperimentService.currentState.next('GenericState') :
                this.newExperimentService.currentState.next('GenericExternalState');
        } else if (category.type == this.newExperimentService.TYPE_CAP_SEQ) {
            this.newExperimentService.currentState.next("CapSeqState");
        } else if (category.type == this.newExperimentService.TYPE_FRAG_ANAL) {
            this.newExperimentService.currentState.next("FragAnalState");
        } else if (category.type == this.newExperimentService.TYPE_MIT_SEQ) {
            this.newExperimentService.currentState.next("MitSeqState");
        } else if (category.type == this.newExperimentService.TYPE_CHERRY_PICK) {
            this.newExperimentService.currentState.next("CherryPickState");
        } else if (category.type == this.newExperimentService.TYPE_ISCAN) {
            this.newExperimentService.currentState.next("IScanState");
        } else if (category.type == this.newExperimentService.TYPE_SEQUENOM) {
            this.newExperimentService.currentState.next("SequenomState");
        } else if (category.type == this.newExperimentService.TYPE_ISOLATION) {
            this.newExperimentService.currentState.next("IsolationState");
        } else if (category.type == this.newExperimentService.TYPE_NANOSTRING) {
            this.newExperimentService.currentState.next("NanoStringState");
        } else if (category.type == this.newExperimentService.TYPE_CLINICAL_SEQUENOM) {
            this.newExperimentService.currentState.next("ClinicalSequenomState");
        } else if (category.type == this.newExperimentService.TYPE_MICROARRAY) {
            this.gnomexService.submitInternalExperiment() ? this.newExperimentService.currentState.next('MicroarrayState') :
                this.newExperimentService.currentState.next('MicroarrayExternalState');
        }

    }

    onTabChange(event) {
        event.tab.nextEnabled = true;
    }

    filterRequestCategories(categories: any[]): any[] {
        var keep: Boolean = false;
        let requestCategories: any[] = [];
        for (let category of categories) {
            if (category.codeRequestCategory === this.coreFacility.codeRequestCategory) {
                requestCategories.push(category);
            } else if (category.isClinicalResearch == null || category.isClinicalResearch != 'Y') {
                if (category.idCoreFacility == this.coreFacility.idCoreFacility) {
                    requestCategories.push(category);
                }
            }
        }
        return requestCategories;
    }

    selectLabOption($event) {
        let value = $event.source.value;
        this.form.get("selectLab").setValue($event.source.value);
        this.filteredProjectList = this.gnomexService.projectList;

        if (!value.idLab) {
            return;
        }
        if (this.currentIdLab != value.idLab) {
            this.currentIdLab = value.idLab;
            let params: URLSearchParams = new URLSearchParams();
            params.set("idLab", value.idLab);
            params.set("includeBillingAccounts", "Y");
            params.set("includeProductCounts", "N");

            this.getLabService.getLabMembers_fromBackend(params);
            this.form.get("selectOwner").setValue("");
            this.form.markAsPristine();
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
        this.newExperimentService.lab = $event.source.value;
    }


    displayLab(lab: any) {
        return lab ? lab.name : lab;
    }

    filterLabList(selectedLab: any) {

        let fLabs: any[];
        if (selectedLab) {
            if (selectedLab.idLab) {
                fLabs = this.labList.filter(lab =>
                    lab.name.toLowerCase().indexOf(selectedLab.name.toLowerCase()) >= 0);
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
        if (this.form.get('selectOwner')) {
            let appUser = this.form.get('selectOwner');
            this.idAppUser = appUser.value;
            this.setVisibility();
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
        if (!this.securityAdvisor.isAdmin && !this.securityAdvisor.isSuperAdmin) {
            this.showProject = true;
            this.showBilling = true;
            this.idAppUser = this.securityAdvisor.idAppUser.toString();
        }
        let cat = this.getRequestCategory();
        this.authorizedBillingAccounts = this.authorizedBillingAccounts.filter(account => {
            return account.overrideFilter === 'Y' || (cat.idCoreFacility && account.idCoreFacility === cat.idCoreFacility);
        });

        this.selectDefaultUserProject();
        this.setVisibility();
    }

    checkSecurity(): void {
        if (this.gnomexService.hasPermission("canWriteAnyObject")) {
            if (this.gnomexService.submitInternalExperiment()) {
                this.adminState = "AdminState";
            } else {
                this.adminState = "AdminExternalExperimentState";
            }
        } else if (this.gnomexService.hasPermission('canSubmitForOtherCores') && this.gnomexService.coreFacilitiesICanSubmitTo.includes(this.coreFacility)) {
            this.adminState = "AdminState";
        } else {
            if (this.gnomexService.submitInternalExperiment()) {
                this.adminState = "";
            } else {
                this.adminState = "ExternalExperimentState";
            }
            this.idAppUser = this.securityAdvisor.idAppUser.toString();
        }

        this.checkForOtherAccounts();

        this.workAuthInstructions = this.gnomexService.getProperty(this.gnomexService.PROPERTY_WORKAUTH_INSTRUCTIONS);
        this.accessAuthorizedBillingAccountInstructions = this.gnomexService.getProperty(this.gnomexService.PROPERTY_AUTH_ACCOUNTS_DESCRIPTION);

    }

    checkForOtherAccounts(): void {
        if (this.securityAdvisor.isAdmin || this.securityAdvisor.isBillingAdmin || this.securityAdvisor.isSuperAdmin) {
            this.showAccessAuthorizedAccountsLink = true;
            let authorizedBillingAccountsParams: HttpParams = new HttpParams().set("idCoreFacility", this.idCoreFacility);

            this.billingService.getAuthorizedBillingAccounts(authorizedBillingAccountsParams).subscribe((response: any) => {
                this.showAccessAuthorizedAccountsLink = response && response.hasAccountsWithinCore && response.hasAccountsWithinCore === 'Y';
            });
        } else if (this.idAppUser != null && this.idAppUser != '') {
            // TODO
        }

    }

    setVisibility(): void {
        var visible: boolean = true;
        if (!this.form.get("selectedCategory").value) {
            visible = !this.gnomexService.submitInternalExperiment();
        }
        this.showLab = visible;

        if (this.form.get("selectLab").value === null) {
            visible = !this.gnomexService.submitInternalExperiment();
        }
        if (!this.idAppUser) {
            visible = !this.gnomexService.submitInternalExperiment();
        }
        this.showBilling = visible;

        if (this.form.get("selectedCategory").value && this.getRequestCategory()) {
            this.workAuthLabel = this.gnomexService.getCoreFacilityProperty(this.getRequestCategory().idCoreFacility, this.gnomexService.PROPERTY_REQUEST_WORK_AUTH_LINK_TEXT);
            this.accessAuthLabel = this.gnomexService.getCoreFacilityProperty(this.getRequestCategory().idCoreFacility, this.gnomexService.PROPERTY_ACCESS_AUTH_ACCOUNT_LINK_TEXT);
        }
        if (!this.form.get("selectAccount").value) {
            visible = !this.gnomexService.submitInternalExperiment();
        }
        this.showProject = visible;
        this.showNameDesc = visible;
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
        this.codeRequestCategory = this.requestCategory.codeRequestCategory;
        return this.requestCategory;
    }


    chooseFirstLabOption(): void {
        this.autoLabComplete.options.first.select();
    }

    onProjectSelection(event) {
    }

    onBillingSelection(event) {
        this.setVisibility();
        this.disableNext = false;
    }

    incrementNext() {
        this.nextButtonIndex++;
    }

    selectDefaultUserProject(): void {
        // Default the project dropdown to the the project owned by the user
        if (!this.securityAdvisor.isAdmin && !this.securityAdvisor.isSuperAdmin) {
            this.form.controls['selectOwner'].setErrors(null);
            if (this.idAppUser != null) {
                for (var project of this.filteredProjectList) {
                    if (project.idAppUser === this.idAppUser) {
                        this.form.get('selectProject').setValue(project);
                        break;
                    }
                }
            }
        } else {
            this.form.get('selectProject').setValue(this.filteredProjectList[0]);
        }
    }

    goBack() {
        this.selectedIndex--;
        this.currentComponent = this.componentRefs[this.selectedIndex]
    }

    goNext() {
        switch(this.newExperimentService.currentState.value) {
            case 'SolexaBaseState' : {
                if (this.selectedIndex === 0) {
                    this.tabs[0].disabled = false;
                    this.tabs[1].disabled = false;
                } else if (this.selectedIndex === 1) {
                    this.tabs[2].disabled = false;
                } else if (this.selectedIndex === 3) {
                    this.tabs[3].disabled = false;
                }
            }
        }
        this.selectedIndex++;
        this.currentComponent = this.componentRefs[this.selectedIndex]
    }

    onNewAccount() {

    }

    componentCreated(compRef: ComponentRef<any>) {
        if (compRef) {
            this.componentRefs.push(compRef.instance);
        }
    }

    ngOnDestroy() {

    }

    sortRequestCategory(obj1: any, obj2: any): number {
        if (obj1 === null && obj2 === null) {
            return 0;
        } else if (obj1 == null) {
            return 1;
        } else if (obj2 == null) {
            return -1;
        } else {
            var idCore1: number = obj1.idCoreFacility === "" ? 999 : obj1.idCoreFacility;
            var idCore2: number = obj2.idCoreFacility === "" ? 999 : obj2.idCoreFacility;

            var sortOrder1: number = obj1.sortOrder === "" ? 999 : obj1.sortOrder;
            var sortOrder2: number = obj2.sortOrder === "" ? 999 : obj2.sortOrder;

            var display1: string = obj1.display;
            var display2: string = obj2.display;

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


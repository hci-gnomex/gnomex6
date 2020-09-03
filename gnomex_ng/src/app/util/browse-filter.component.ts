import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';

import {LabListService} from "../services/lab-list.service";
import {GetLabService} from "../services/get-lab.service";
import {AppUserListService} from "../services/app-user-list.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {ExperimentsService} from "../experiments/experiments.service";
import {AnalysisService} from "../services/analysis.service";
import {DictionaryService} from "../services/dictionary.service";
import {DataTrackService} from "../services/data-track.service";
import {BillingService} from "../services/billing.service";
import {DialogsService} from "./popup/dialogs.service";
import {DateRange} from "./date-range-filter.component";
import {forkJoin, Subscription} from "rxjs";
import {UserPreferencesService} from "../services/user-preferences.service";
import {HttpParams} from "@angular/common/http";
import {UtilService} from "../services/util.service";
import {PropertyService} from "../services/property.service";
import {ConstantsService} from "../services/constants.service";
import {GnomexService} from "../services/gnomex.service";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {NavigationService} from "../services/navigation.service";
import {INavigationDefinition, IRequiredParam} from "./interfaces/navigation-definition.model";
import {IGnomexErrorResponse} from "./interfaces/gnomex-error.response.model";
import {HttpUriEncodingCodec} from "../services/interceptors/http-uri-encoding-codec";

@Component({
    selector: 'browse-filter',
    templateUrl: "./browse-filter.component.html",
    styles: [`
        input.filterTextInput {
            background: gainsboro;
        }

        .filter {
            font-size: 12px;
            width: 100%;
            border: 1px solid grey;
            background-color: white;
        }

        button.showHideButton {
            border: none;
            background: none;
            border-radius: 5px;
        }

        button.showHideButton:hover {
            background: deepskyblue;
        }

        button.searchButton {
            border: 1px solid grey;
            border-radius: 5px;
            background: gainsboro;
        }

        button.searchButton:hover {
            background: deepskyblue;
        }

        div.inlineDiv {
            display: flex;
            align-items: center;
        }

        div.labelAndIcon {
            display: flex;
            align-items: center;
            width: 11em;
            padding-left: 0.5em;
        }

        div.divider {
            display: inline;
            border-left: 1px solid lightgrey;
            height: 1.5em;
        }

        .children-spaced > *:not(:last-child) {
            margin-right: 1em;
        }

        div.filter-row-top {
            margin: 0.5em 0;
        }

        div.filter-row-bottom {
            padding-left: 12em;
            margin: 0 0 0.5em 0;
        }

        label.leading-label {
            margin-right: 0.3em;
        }

        label.following-label {
            margin-left: 0.3em;
        }
        .padding-right {
            padding-right: 1em;
        }
        .collapse-expand-button {
            background: none;
            border: none;
            cursor: pointer;
        }
        .collapse-expand-icon {
            height: 1.5em;
        }
    `]
})

export class BrowseFilterComponent implements OnInit, OnDestroy {
    readonly SHOW_EMPTY_FOLDERS: string = "Show Empty Folders";
    readonly DATA_TRACK_BROWSE: string = "dataTrackBrowse";
    readonly ANALYSIS_BROWSE: string = "analysisBrowse";
    readonly ORDER_BROWSE: string = "orderBrowse";
    readonly EXPERIMENT_BROWSE: string = "experimentBrowse";

    @Input() public mode: string = "";

    public showLabelAndIcon: boolean = true;
    @Input() public label: string = "";
    @Input() public iconSource: string = "";
    @Input() public iconAlt: string = "icon";
    @Input() private lookupLab: string = "";

    // need these to set model programmatically
    public selectedLab: string = "";
    public selectedLabs :string[] = [];
    public selectedOwner: any;
    public selectedCoreFacility: any;
    public selectedRequestCategory: any;
    public selectedLabMember: any;
    public selectedOrganism: any;
    public selectedGenomeBuild: any;

    public showAllCheckbox: boolean = false;
    public allFlag: boolean;

    public showDateRangePicker: boolean = false;
    private dateFromString: string;
    private dateToString: string;

    private idBillingPeriodString: string;

    private showSearchTextInput: boolean = false;
    private searchText: string;

    private showMoreSwitch: boolean = false;
    private showMore: boolean = false;

    private showExternalExperimentsCheckbox: boolean = false;
    private externalExperimentsFlag: boolean = false;

    private showPublicCheckbox: boolean = false;
    private publicFlag: boolean = false;

    private showCoreFacilityComboBox: boolean = false;
    private coreFacilityList: any[] = [];

    private showRequestCategoryComboBox: boolean = false;
    private requestCategoryList: any[] = [];

    private showOrganismComboBox: boolean = false;
    public organismList: any[] = [];

    public showGenomeBuildComboBox: boolean = false;
    public genomeBuildList: any[] = [];

    public showCCNumberInput: boolean = false;
    public ccNumberString: string;

    public showExperimentsRadioGroup: boolean = false;
    public experimentsRadioString: string;

    private showAnalysesRadioGroup: boolean = false;
    private analysesRadioString: string;

    public showWorkflowStateRadioGroup: boolean = false;
    public workflowStateString: string;

    public showRedosCheckbox: boolean = false;
    public redosFlag: boolean = false ;

    public showOrderNumberInput: boolean = false;
    private orderNumberString: string;

    private showExperimentNumberInput: boolean = false;
    private experimentNumberString: string;

    private showInvoiceNumberInput: boolean = false;
    private invoiceNumberString: string;

    private showVisibilityCheckboxes: boolean = false;
    private visibilityOwnerFlag: boolean = false ;
    private visibilityInstitutionFlag: boolean = false;
    private visibilityAllLabMembersFlag: boolean = false;
    private visibilityPublicFlag: boolean = false ;

    public showLabComboBox: boolean = false;
    private showLabMultiSelectComboBox: boolean = false;
    public labList: any[] = [];
    public ownerList: any[] = [];
    public showOwnerComboBox: boolean = false;
    private showLabMembersComboBox: boolean = false;
    private labMembersList: any[] = [];
    private idAppUserString: string;

    private showEmptyFoldersCheckbox: boolean = false;
    private showEmptyFoldersCheckboxLabel: string = this.SHOW_EMPTY_FOLDERS;
    private showEmptyFoldersFlag: boolean = false ;

    private labListSubscription: Subscription;

    public isCollapsed: boolean = false;

    private paramMap:ParamMap;
    private qParamMap:ParamMap;
    private  navToViewMap:any;
    private browseTreeSubscription: Subscription;
    private navByLookUp: boolean = false;


    constructor(private labListService: LabListService, private getLabService: GetLabService,
                private appUserListService: AppUserListService, private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private experimentsService: ExperimentsService, private analysisService: AnalysisService, private dataTrackService: DataTrackService,
                private dictionaryService: DictionaryService, private billingService: BillingService,
                private dialogService: DialogsService, public constantsService: ConstantsService,
                public propertyService: PropertyService,
                private gnomexService: GnomexService,
                private navigationService: NavigationService,
                private route:ActivatedRoute,
                private router:Router,
                public prefService: UserPreferencesService) {
        this.showMore = false;
        this.resetFields();
    }

    ngOnInit() {
        let isAdminState: boolean = this.createSecurityAdvisorService.isSuperAdmin || this.createSecurityAdvisorService.isAdmin;
        let isGuestState: boolean = this.createSecurityAdvisorService.isGuest;

        if (this.mode === this.EXPERIMENT_BROWSE) {
            let isBSTLinkageSupported: boolean = this.propertyService.getPropertyAsBoolean(PropertyService.PROPERTY_BST_LINKAGE_SUPPORTED);
            let canAccessBSTX: boolean = this.propertyService.getPropertyAsBoolean(PropertyService.PROPERTY_CAN_ACCESS_BSTX);
            if (isAdminState) {
                this.showAllCheckbox = true;
                this.showLabComboBox = true;
                this.showOwnerComboBox = true;
                this.showDateRangePicker = true;
                this.showMoreSwitch = true;
                this.showExternalExperimentsCheckbox = true;
                this.showCoreFacilityComboBox = true;
                this.showRequestCategoryComboBox = true;
                this.showCCNumberInput = isBSTLinkageSupported && canAccessBSTX;

                this.labListSubscription = this.labListService.getLabListSubject().subscribe((response: any[]) => {
                    if(response.length > 0){
                        this.labList = response
                            .sort(this.prefService.createLabDisplaySortFunction());
                        // no preselectOnBrowse needed because the onlabSelect sets it there

                    }
                });
            } else if (isGuestState) {
                this.showMoreSwitch = true;
                this.showMore = true;
                this.showDateRangePicker = true;
                this.preselectOnBrowseFilter();
            } else { // experiment group user view
                this.showExperimentsRadioGroup = true;
                this.showDateRangePicker = true;
                this.showMoreSwitch = true;
                this.showExternalExperimentsCheckbox = true;
                this.showLabMembersComboBox = true;
                this.showCoreFacilityComboBox = true;
                this.showRequestCategoryComboBox = true;
                this.showCCNumberInput = isBSTLinkageSupported && canAccessBSTX;

                this.labListSubscription = this.labListService.getLabListSubject().subscribe((response: any[]) => {
                    this.labList = response
                        .filter(lab => lab.isMyLab === 'Y')
                        .sort(this.prefService.createLabDisplaySortFunction());
                    if (this.labList.length > 1) {
                        this.showLabComboBox = true;
                    }

                },(err:IGnomexErrorResponse) =>{});

                this.appUserListService.getMembersOnly().subscribe((response: any) => {
                    this.labMembersList = UtilService.getJsonArray(response, response.AppUser)
                        .sort(this.prefService.createUserDisplaySortFunction());

                    setTimeout(()=>{
                        //all though there could be a race condition with getLabList the idLab was already set so the search with use that id.
                        this.preselectOnBrowseFilter()
                    })
                },(err:IGnomexErrorResponse) =>{});


            }
            this.coreFacilityList = this.createSecurityAdvisorService.myCoreFacilities;
        }
        else if (this.mode === this.ORDER_BROWSE) {
            if (isAdminState) {
                this.showWorkflowStateRadioGroup = true;
                this.showRedosCheckbox = true;
                this.showDateRangePicker = true;
                this.showOrderNumberInput = true;
                this.showMoreSwitch = true;
                this.showCoreFacilityComboBox = true;
                this.showRequestCategoryComboBox = true;

                this.showMore = true;

                this.coreFacilityList = this.createSecurityAdvisorService.myCoreFacilities;
                this.preselectOnBrowseFilter();
            }
        }
        else if (this.mode === this.ANALYSIS_BROWSE) {
            if (isAdminState) {
                this.showMoreSwitch = true;
                this.showAllCheckbox = true;
                this.showDateRangePicker = true;
                this.showSearchTextInput = true;
                this.showPublicCheckbox = true;
                this.showLabMultiSelectComboBox = true;
                this.showOrganismComboBox = true;
                this.showGenomeBuildComboBox = true;

                this.showMore = true;

                this.labListSubscription = this.labListService.getLabListSubject().subscribe((response: any[]) => {
                    this.labList = response
                        .sort(this.prefService.createLabDisplaySortFunction());
                    if(this.labList.length > 0){
                        this.preselectOnBrowseFilter();
                    }
                });
            } else if (isGuestState) {
                this.showDateRangePicker = true;
                this.showSearchTextInput = true;
                this.showOrganismComboBox = true;
                this.showGenomeBuildComboBox = true;
                this.preselectOnBrowseFilter();
            } else {
                this.showDateRangePicker = true;
                this.showSearchTextInput = true;
                this.showAnalysesRadioGroup = true;
                this.showOrganismComboBox = true;
                this.showGenomeBuildComboBox = true;
                this.showMoreSwitch = true;

                this.labListSubscription = this.labListService.getLabListSubject().subscribe((response: any[]) => {
                    this.labList = response
                        .filter(lab => lab.isMyLab === 'Y')
                        .sort(this.prefService.createLabDisplaySortFunction());
                    if (this.labList.length > 1) {
                        this.showLabComboBox = true;
                        this.preselectOnBrowseFilter();
                    }
                });

                this.showMore = true;
            }

            this.organismList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ORGANISM);
        }
        else if (this.mode === this.DATA_TRACK_BROWSE) {
            if (isAdminState) {
                this.showOrganismComboBox = true;
                this.showGenomeBuildComboBox = true;
                this.showLabComboBox = true;
                this.showVisibilityCheckboxes = true;

                this.labListSubscription = this.labListService.getLabListSubject().subscribe((response: any[]) => {
                    this.labList = response
                        .sort(this.prefService.createLabDisplaySortFunction());
                    if(this.labList.length > 0){
                        this.preselectOnBrowseFilter();
                    }
                });
            } else if (isGuestState) {
                this.showOrganismComboBox = true;
                this.showGenomeBuildComboBox = true;
                this.preselectOnBrowseFilter()
            } else {
                this.showOrganismComboBox = true;
                this.showGenomeBuildComboBox = true;
                this.showVisibilityCheckboxes = true;

                this.labListSubscription = this.labListService.getLabListSubject().subscribe((response: any[]) => {
                    this.labList = response
                        .filter(lab => lab.isMyLab === 'Y')
                        .sort(this.prefService.createLabDisplaySortFunction());
                    if (this.labList.length > 1) {
                        this.showLabComboBox = true;
                        this.preselectOnBrowseFilter();
                    }

                });
            }

            this.organismList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ORGANISM);
        }

        this.setNavParams();

        //todo need to rework logic
        if ((isGuestState || !this.createSecurityAdvisorService.isAdmin) &&
            !(this.navigationService.navMode === NavigationService.URL)) {
            setTimeout(() => {
                this.search();
            });
        }



        this.browseTreeSubscription =  this.navigationService.getBrowseTreeSetupSubject()
            .subscribe(()=>{
                this.setupFilter(isAdminState,isGuestState);
            });
    }

    setNavParams():void{
        this.navToViewMap  = {
            idCoreFacility : ["selectedCoreFacility"],
            codeRequestCategory : ["selectedRequestCategory"],
            ccNumber: ["ccNumberString"],
            allExperiments: ["allFlag"],
            labKeys:["selectedLabs"],
            idLab : ["selectedLab"],
            idAppUser : [{"selectedOwner": this.showOwnerComboBox} , {"selectedLabMember": this.showExperimentsRadioGroup} ],
            expRadio:["experimentsRadioString"],
            isExternalOnly: ["externalExperimentsFlag"],
            createDateFrom: [null],
            createDateTo: [null],
            number: ["orderNumberString"],
            status: ["workflowStateString"],
            hasRedo: ["redosFlag"],
            allAnalysis: ["allFlag"],
            anaRadio : ["analysesRadioString"],
            publicFlag :["publicFlag"],
            searchText : ["searchText"],
            idOrganism: ["selectedOrganism"],
            idGenomeBuild: ["selectedGenomeBuild"],
            isVisibilityPublic: ["visibilityPublicFlag"],
            isVisibilityOwner: ["visibilityOwnerFlag"],
            isVisibilityMembers: ["visibilityAllLabMembersFlag"],
            isVisibilityInstitute: ["visibilityInstitutionFlag"]
        };

        this.route.queryParamMap.subscribe((qParam)=>{this.qParamMap = qParam });
        this.route.paramMap.subscribe((qParam)=>{this.paramMap = qParam });

        try {
            for (let navKey of this.qParamMap.keys) {
                let classPropArray: (string | any)[] = this.navToViewMap[navKey];
                if(classPropArray === null || classPropArray === undefined) {
                    console.debug(navKey + " not set because it doesn't map to browse-filter field or is not supported yet");
                    continue;
                }
                for (let classProp of classPropArray) {
                    let classPropName:string = "";
                    // if obj determine if classPropName should be set  based on its boolean value
                    if (typeof classProp !== "string") {
                        let keys = Object.keys(classProp);
                        if(keys && keys.length === 1) {
                            if(!classProp[keys[0]]) {
                                continue;
                            }
                            classPropName =  keys[0];
                        }else{
                            throw new Error("navToViewMap only can hold either a string or object of one key value pair. ");
                        }
                    }else{ // its a string it should be set
                        classPropName = classProp;
                    }

                    //now set actual value in component
                    if (typeof this[classPropName] === "boolean") {
                        this[classPropName] = this.qParamMap.get(navKey) === 'Y';
                    } else if(typeof this[classPropName] === "string") {
                        this[classPropName] = this.qParamMap.get(navKey);
                    }else{ // an array
                        this[classPropName] = (<string>this.qParamMap.get(navKey)).split(":")
                    }

                }

            }
            if(this.selectedLab && this.showLabMultiSelectComboBox){
                this.selectedLabs = [this.selectedLab];
            }
        }catch(e){
            console.debug(e);
        }

    }

    setupFilter(isAdminState:boolean, isGuestState:boolean){
        this.navByLookUp = true;
        this.setNavParams();
        this.preselectOnBrowseFilter();
    }


    resetFields(): void {
        this.allFlag = false;
        this.setExperimentDefaultView();
        this.analysesRadioString = "myLab";
        this.workflowStateString = "SUBMITTED";
        this.redosFlag = false;
        this.orderNumberString = "";
        this.selectedLab = "";
        this.selectedLabs = [];
        this.ownerList = [];
        this.selectedOwner = "";
        this.dateFromString = "";
        this.dateToString = "";
        this.searchText = "";
        this.externalExperimentsFlag = false;
        this.publicFlag = false;
        this.selectedCoreFacility = "";
        this.coreFacilityList = [];
        this.selectedRequestCategory = "";
        this.selectedOrganism = "";
        this.selectedGenomeBuild = "";
        this.ccNumberString = "";
        this.showEmptyFoldersFlag = false;
        this.visibilityOwnerFlag = true;
        this.visibilityInstitutionFlag = true;
        this.visibilityAllLabMembersFlag = true;
        this.visibilityPublicFlag = true;
        this.experimentNumberString = "";
        this.invoiceNumberString = "";
        this.idBillingPeriodString = "";
    }

    private setExperimentDefaultView(): void {
        let propertyDefaultValue: string = this.propertyService.getPropertyValue(PropertyService.PROPERTY_EXPERIMENT_DEFAULT_VIEW).toLowerCase();
        if (propertyDefaultValue) {
            if (propertyDefaultValue.includes("experiments")) {
                this.experimentsRadioString = "myExperiments";
            } else if (propertyDefaultValue.includes("lab")) {
                this.experimentsRadioString = "myLab";
            } else if (propertyDefaultValue.includes("collaborations")) {
                this.experimentsRadioString = "myCollaborations";
            } else if (propertyDefaultValue.includes("public")) {
                this.experimentsRadioString = "publicData";
            } else {
                this.experimentsRadioString = "all";
            }
        } else {
            this.experimentsRadioString = "myLab";
        }
    }

    toggleShowMore(): void {
        this.showMore = !this.showMore;
        if (!this.showMore) {
            this.selectedLabs = [];
            this.resetCoreFacilitySelection();
            if (this.showLabMembersComboBox) {
                this.selectedOwner = "";
            }
        }
    }

    resetLabSelection(): void {
        this.selectedLab = "";
        this.selectedOwner = "";
        this.ownerList = [];
    }

    onLabSelect(event: any): void {
        if (event) {
            this.selectedLab = event;
            if (this.showOwnerComboBox) {
                this.getLabService.getLabByIdOnlyForHistoricalOwnersAndSubmitters(this.selectedLab).subscribe((response: any) => {
                    if (response.Lab.historicalOwnersAndSubmitters) {
                        this.ownerList = UtilService.getJsonArray(response.Lab.historicalOwnersAndSubmitters, response.Lab.historicalOwnersAndSubmitters.AppUser)
                            .sort(this.prefService.createUserDisplaySortFunction());
                    } else {
                        this.ownerList = [];
                    }
                    if(!this.navByLookUp && this.navigationService.navMode === NavigationService.URL){
                        setTimeout(()=>{
                            this.preselectOnBrowseFilter();
                        });
                    }
                });
            }
        } else {
            this.resetLabSelection();
        }
    }

    onMultiLabChange(labs: any[]): void {
        this.selectedLabs = [];
        for (let lab of labs) {
            this.selectedLabs.push(lab);
        }
    }

    onAppUserSelect(event: any): void {
        if (event) {
            this.idAppUserString = event;
        } else {
            this.idAppUserString = "";
        }
    }


    onCoreFacilitySelect(event: any): void {
        if (event) {
            this.selectedCoreFacility = event;
            if (this.showRequestCategoryComboBox) {
                let requestCategories = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY);
                this.requestCategoryList = requestCategories.filter(cat => {
                    if (cat.isActive === "Y" && !(cat.value === "") && cat.isInternal === "Y") {
                        return cat.idCoreFacility === this.selectedCoreFacility;
                    }
                    return false;
                });
            }
        } else {
            this.resetCoreFacilitySelection();
        }
    }

    resetCoreFacilitySelection(): void {
        this.selectedCoreFacility = "";
        this.selectedRequestCategory = "";
        this.requestCategoryList = [];
    }

    onOrganismSelect(event: any): void {
        if (event) {
            this.selectedOrganism = event;
            if (this.showGenomeBuildComboBox) {
                let genomeBuilds = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.GENOME_BUILD);
                this.genomeBuildList = genomeBuilds.filter(gen => {
                    if (gen.isActive === "Y" && !(gen.value === "")) {
                        return gen.idOrganism === this.selectedOrganism;
                    }
                    return false;
                });
            }
        } else {
            this.resetOrganismSelection();
        }
    }

    resetOrganismSelection(): void {
        this.selectedOrganism = "";
        this.selectedGenomeBuild = "";
        this.genomeBuildList = [];
    }

    onGenomeBuildSelect(event: any): void {
        if (event) {
            this.selectedGenomeBuild = event;
        } else {
            this.selectedGenomeBuild = "";
        }
    }

    onRequestCategorySelect(event: any): void {
        if (event) {
            this.selectedRequestCategory = event;
        } else {
            this.selectedRequestCategory = "";
        }
    }

    onExperimentsRadioGroupChange(): void {
        if (this.showExperimentsRadioGroup && this.showLabMembersComboBox && !(this.experimentsRadioString === "myLab")) {
            this.idAppUserString = "";
        }
    }

    public onDateRangePickerChange(event: DateRange): void {
        if (event.from && event.to) {
            this.dateFromString = event.from.toLocaleDateString();
            this.dateToString = event.to.toLocaleDateString();
        } else {
            this.dateFromString = "";
            this.dateToString = "";
        }
    }

    private preselectOnBrowseFilter() {
        if(this.navigationService.navMode === NavigationService.URL){
            setTimeout(()=>{
                this.search();
                this.navigationService.emitResetNavModeSubject("experiments");
                this.navigationService.emitResetNavModeSubject("analysis");
                this.navigationService.emitResetNavModeSubject("datatracks");
                this.navigationService.emitResetNavModeSubject("topics");
                this.navigationService.emitResetNavModeSubject("experiments-orders")

            });
        }
    }

    setParamFromState(stateCondition:boolean, paramName:string, paramValue:string, params:HttpParams ):HttpParams{
        return stateCondition && paramValue ? params.set(paramName,paramValue) : params.delete(paramName);
    }

    getExperimentBrowseParameters(): HttpParams {
        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()});

        if (this.showCoreFacilityComboBox && !(this.selectedCoreFacility === "")) {
            params = params.set("idCoreFacility", this.selectedCoreFacility);

            if (this.showRequestCategoryComboBox && !(this.selectedRequestCategory === "")) {
                params = params.set("codeRequestCategory", this.selectedRequestCategory);
            }else{
                params = params.delete("codeRequestCategory");
            }
        }else{
            params = params.delete("idCoreFacility");
        }

        if (this.showCCNumberInput && !(this.ccNumberString === "")) {
            params = params.set("ccNumber", this.ccNumberString);
        }else{
            params = params.delete("ccNumber");
        }

        if (this.showAllCheckbox && this.allFlag) {
            params = params.set("allExperiments", "Y");
        } else {
            params = params.delete("allExperiments"); // null vs 'N'. null will take it out of url

            if (this.showLabComboBox && !(this.selectedLab === "")) {
                params = params.set("idLab", this.selectedLab);
            }else{
                params = params.delete("idLab");
            }
            if (this.showOwnerComboBox && !(this.idAppUserString === "")) {
                params = params.set("idAppUser", this.selectedOwner);
            }else{
                params = params.delete("idAppUser");
            }
            if (this.showExperimentsRadioGroup) {
                let expCondition:boolean = this.experimentsRadioString === "myExperiments";
                let labCondition = this.experimentsRadioString === "myLab" && this.showLabMembersComboBox && !(this.idAppUserString === "");
                let collabCondition:boolean = this.experimentsRadioString === "myCollaborations";
                let publicCondition:boolean = this.experimentsRadioString === "publicData";
                let allCondition:boolean = this.experimentsRadioString === "all";

                params = params.set("expRadio", this.experimentsRadioString);

                if(expCondition){
                    params = this.setParamFromState(expCondition,"idAppUser", this.createSecurityAdvisorService.idAppUser.toString(),params );
                }else if(labCondition){
                    params = this.setParamFromState(labCondition,"idAppUser",this.selectedLabMember,params);
                }else if(collabCondition){
                    params = this.setParamFromState(collabCondition,"allCollaborations", "Y",params);
                    params = this.setParamFromState(collabCondition, "idAppUser", this.createSecurityAdvisorService.idAppUser.toString(), params);
                }else if(publicCondition){
                    let publicAllowed = this.propertyService.isPublicVisbility(); // stopping them from setting public data from url even if view doesn't give option to select
                    params = this.setParamFromState(publicCondition,"publicExperimentsInOtherGroups", publicAllowed ? 'Y' : 'N' , params);
                }else if(allCondition){
                    params = this.setParamFromState (allCondition, "allExperiments", "Y",params);
                }else{
                    params = params.delete("expRadio");
                }
            }
        }
        if (this.showExternalExperimentsCheckbox && this.externalExperimentsFlag) {
            params = params.set("isExternalOnly", "Y");
        }else{
            params = params.delete("isExternalOnly");
        }
        params = params.set("showMyLabsAlways", this.createSecurityAdvisorService.isSuperAdmin || this.createSecurityAdvisorService.isAdmin ? "N" : "Y");


        if (this.showDateRangePicker && !(this.dateFromString === "") && !(this.dateToString === "")) {
            params = params.set("createDateFrom", this.dateFromString);
            params = params.set("createDateTo", this.dateToString);
        }else{
            params = params.delete("createDateFrom");
            params = params.delete("createDateTo");
        }

        params = params.set("showEmptyProjectFolders", "Y");

        params = params.set("showSamples", "N");
        params = params.set("showCategory", "N");


        return params;
    }

    getOrderBrowseParameters(): HttpParams {
        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()});

        params = params.set("includeSampleInfo", "Y");

        if (this.showDateRangePicker && !(this.dateFromString === "") && !(this.dateToString === "")) {
            params = params.set("createDateFrom", this.dateFromString);
            params = params.set("createDateTo", this.dateToString);
        }else{
            params = params.delete("createDateFrom");
            params = params.delete("createDateTo");
        }

        if (this.showOrderNumberInput && !(this.orderNumberString === "")) {
            params = params.set("number", this.orderNumberString);
            this.workflowStateString = "";
        }else{
            params = params.delete("number");
        }

        if (this.showWorkflowStateRadioGroup && !(this.workflowStateString === "")) {
            params = params.set("status", this.workflowStateString);
        }else{
            params = params.delete("status");
        }

        if (this.showRedosCheckbox && this.redosFlag) {
            params = params.set("hasRedo", "Y");
        }else{
            params.delete("hasRedo")
        }

        if (this.showCoreFacilityComboBox && !(this.selectedCoreFacility === "")) {
            params = params.set("idCoreFacility", this.selectedCoreFacility);

            if (this.showRequestCategoryComboBox && !(this.selectedRequestCategory === "")) {
                params = params.set("codeRequestCategory", this.selectedRequestCategory);
            }else{
                params.delete("codeRequestCategory");
            }
        }else{
            params = params.delete("idCoreFacility");
            params = params.delete("codeRequestCategory");
        }

        return params;
    }

    getAnalysisBrowseParameters(): HttpParams {
        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()});

//        params = params.set('getdatatrackdata','N');

        if (this.showAllCheckbox && this.allFlag) {
            params = params.set("allAnalysis", "Y");
        } else {
            params = params.delete("allAnalysis");

            if (this.showAnalysesRadioGroup) {
                let allCondition:boolean = this.analysesRadioString === "all";
                let analysisCondition:boolean = this.analysesRadioString === "myAnalyses";
                let labCondition:boolean = this.analysesRadioString === "otherLabs";

                params = params.set("anaRadio",this.analysesRadioString);

                if(allCondition){
                    params = this.setParamFromState(allCondition,"allAnalysis", "Y",params);
                }else if(analysisCondition){
                    params = this.setParamFromState(analysisCondition,"idAppUser", this.createSecurityAdvisorService.idAppUser.toString(),params);
                }else if(labCondition){
                    params = this.setParamFromState(labCondition, "publicAnalysisOtherGroups", "Y",params);
                }else{
                    params = params.delete("anaRadio");
                }

            }

            params = params.set("showMyLabsAlways", (this.createSecurityAdvisorService.isSuperAdmin || this.createSecurityAdvisorService.isAdmin || this.selectedLab) ? "N" : "Y");

            if (this.createSecurityAdvisorService.isGuest || (this.showPublicCheckbox && this.publicFlag)) {
                params = params.set("publicProjects", "Y");
            }else{
                params = params.delete("publicProjects");
            }

            if (this.showDateRangePicker && !(this.dateFromString === "") && !(this.dateToString === "")) {
                params = params.set("createDateFrom", this.dateFromString);
                params = params.set("createDateTo", this.dateToString);
            }else{
                params = params.delete("createDateFrom");
                params = params.delete("createDateTo");
            }

            if (this.showSearchTextInput && !(this.searchText === "")) {
                params = params.set("searchText", this.searchText);
            }else{
                params = params.delete("searchText");
            }

            if (this.showLabComboBox && this.selectedLab && !(this.analysesRadioString === "otherLabs" || this.analysesRadioString === "all")) {
                params = params.set("idLab", this.selectedLab);
            }else{
                params = params.delete("idLab");
            }

            if (this.showLabMultiSelectComboBox && this.selectedLabs.length > 0) {
                let labKeys: string = "";
                let  multiSelectIdLabs: Set<string> = new Set<string>(this.selectedLabs);
                multiSelectIdLabs.forEach(function (lab: string) {
                    if (labKeys === "") {
                        labKeys = labKeys.concat(lab);
                    } else {
                        labKeys = labKeys.concat(":", lab);
                    }
                }, this);
                params = params.set("labKeys", labKeys);
            }else{
                params = params.delete("labKeys");
            }

            if (this.showOrganismComboBox && !(this.selectedOrganism === "")) {
                params = params.set("idOrganism", this.selectedOrganism);
                if (this.showGenomeBuildComboBox && !(this.selectedGenomeBuild === "")) {
                    params = params.set("idGenomeBuild", this.selectedGenomeBuild);
                }else{
                    params = params.delete("idGenomeBuild");
                }
            }else{
                params= params.delete("idOrganism");
                params = params.delete("idGenomeBuild");
            }
        }

        return params;
    }

    getDataTrackBrowseParameters(): HttpParams {
        let params: HttpParams = new HttpParams();

        if (this.showLabComboBox && !(this.selectedLab === "")) {
            params = params.set("idLab", this.selectedLab);
        }else{
            params = params.delete("idLab");
        }

        if (this.showOrganismComboBox && !(this.selectedOrganism === "")) {
            params = params.set("idOrganism", this.selectedOrganism);
            if (this.showGenomeBuildComboBox && !(this.selectedGenomeBuild === "")) {
                params = params.set("idGenomeBuild", this.selectedGenomeBuild);
            }else{
                params = params.delete("idGenomeBuild");
            }
        }else{
            params= params.delete("idOrganism");
            params = params.delete("idGenomeBuild");
        }

        if (this.showVisibilityCheckboxes) {
            params = params.set("isVisibilityPublic", this.visibilityPublicFlag ? "Y" : "N");
            params = params.set("isVisibilityOwner", this.visibilityOwnerFlag ? "Y" : "N");
            params = params.set("isVisibilityMembers", this.visibilityAllLabMembersFlag ? "Y" : "N");
            params = params.set("isVisibilityInstitute", this.visibilityInstitutionFlag ? "Y" : "N");
        }

        return params;
    }

    setURLFromParams(requiredParams:IRequiredParam[], params:HttpParams):void{
        // specifiy required params if they have id with put name of id so it can look it up off the params obj
        let navDef:INavigationDefinition = this.navigationService.createNavDef(requiredParams, params, this.qParamMap, this.navToViewMap);
        if(this.navigationService.navMode === NavigationService.USER){

            navDef.optionalParams.relativeTo = this.route;
            navDef.optionalParams.queryParamsHandling = 'merge';
            this.router.navigate(navDef.requiredParams,navDef.optionalParams);
        }
    }

    search(): void {
        if (this.mode === this.EXPERIMENT_BROWSE) {
            let params: HttpParams = this.getExperimentBrowseParameters();
            let requiredParams = [ {experiments: ""}];
            this.experimentsService.browsePanelParams = params;
            this.experimentsService.browsePanelParams["refreshParams"] = true;
            this.experimentsService.getProjectRequestList_fromBackend(params);
            this.setURLFromParams(requiredParams,params );
        } else if (this.mode === this.ORDER_BROWSE) {
            this.dialogService.startDefaultSpinnerDialog();
            let params: HttpParams = this.getOrderBrowseParameters();
            let requiredParams = [ {"experiments-orders": ""}];
            this.experimentsService.getExperiments_fromBackend(params);
            this.setURLFromParams(requiredParams,params );
        } else if (this.mode === this.ANALYSIS_BROWSE) {
            let params: HttpParams = this.getAnalysisBrowseParameters();
            let requiredParams = [ {analysis: ""}];
            this.analysisService.analysisPanelParams = params;
            this.analysisService.analysisPanelParams["refreshParams"] = true;
            this.analysisService.getAnalysisGroupList_fromBackend(params);
            this.setURLFromParams(requiredParams,params );
        } else if (this.mode === this.DATA_TRACK_BROWSE) {
            let params: HttpParams = this.getDataTrackBrowseParameters();
            let requiredParams = [ {datatracks: ""}];
            this.dataTrackService.previousURLParams = params;
            this.dataTrackService.previousURLParams["refreshParams"] = true;
            this.dataTrackService.getDatatracksList_fromBackend(params);
            this.setURLFromParams(requiredParams,params );
        }
    }

    public toggleCollapseExpand(): void {
        this.isCollapsed = !this.isCollapsed;
    }

    ngOnDestroy(){
        if(this.labListSubscription){
            this.labListSubscription.unsubscribe();
            this.labListService.resetLabListSubject();
        }
        if(this.browseTreeSubscription){
            this.browseTreeSubscription.unsubscribe();
        }
    }


}

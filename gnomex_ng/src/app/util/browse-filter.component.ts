import {Component, Input, OnInit} from '@angular/core';
import {URLSearchParams} from "@angular/http";

import {LabListService} from "../services/lab-list.service";
import {GetLabService} from "../services/get-lab.service";
import {jqxComboBox} from "jqwidgets-framework";
import {jqxCalendar} from "jqwidgets-framework";
import {AppUserListService} from "../services/app-user-list.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {ExperimentsService} from "../experiments/experiments.service";
import {AnalysisService} from "../services/analysis.service";
import {DictionaryService} from "../services/dictionary.service";
import {DataTrackService} from "../services/data-track.service";
import {BillingService} from "../services/billing.service";

@Component({
    selector: 'browse-filter',
    templateUrl: "./browse-filter.component.html",
    styles: [require("./browse-filter.component.less").toString()]
})

export class BrowseFilterComponent implements OnInit {
    readonly SHOW_EMPTY_FOLDERS: string = "Show Empty Folders";
    readonly HIDE_REQUESTS_WITH_NO_BILLING_ITEMS: string = "Hide requests with no billing items?";
    readonly DATA_TRACK_BROWSE: string = "dataTrackBrowse";
    readonly ANALYSIS_BROWSE: string = "analysisBrowse";
    readonly ORDER_BROWSE: string = "orderBrowse";
    readonly EXPERIMENT_BROWSE: string = "experimentBrowse";
    readonly BILLING_BROWSE: string = "billingBrowse";

    @Input() private mode: string = "";

    private showLabelAndIcon: boolean = true;
    @Input() private label: string = "";
    @Input() private iconSource: string = "";
    @Input() private iconAlt: string = "icon";

    private showAllCheckbox: boolean = false;
    private allFlag: boolean;

    private showDateRangePicker: boolean = false;
    private dateFromString: string;
    private dateToString: string;

    private idBillingPeriodString: string;

    private showSearchTextInput: boolean = false;
    private searchText: string;

    private showMoreSwitch: boolean = false;
    private showMore: boolean;

    private showExternalExperimentsCheckbox: boolean = false;
    private externalExperimentsFlag: boolean;

    private showPublicCheckbox: boolean = false;
    private publicFlag: boolean;

    private showCoreFacilityComboBox: boolean = false;
    private coreFacilityList: any[] = [];
    private idCoreFacilityString: string;

    private showRequestCategoryComboBox: boolean = false;
    private codeRequestCategoryString: string;
    private requestCategoryList: any[] = [];

    private showOrganismComboBox: boolean = false;
    private idOrganismString: string;
    private organismList: any[] = [];

    private showGenomeBuildComboBox: boolean = false;
    private idGenomeBuildString: string;
    private genomeBuildList: any[] = [];

    private showCCNumberInput: boolean = false;
    private ccNumberString: string;

    private showExperimentsRadioGroup: boolean = false;
    private experimentsRadioString: string;

    private showAnalysesRadioGroup: boolean = false;
    private analysesRadioString: string;

    private showWorkflowStateRadioGroup: boolean = false;
    private workflowStateString: string;

    private showRedosCheckbox: boolean = false;
    private redosFlag: boolean;

    private showOrderNumberInput: boolean = false;
    private orderNumberString: string;

    private showExperimentNumberInput: boolean = false;
    private experimentNumberString: string;

    private showInvoiceNumberInput: boolean = false;
    private invoiceNumberString: string;

    private showVisibilityCheckboxes: boolean = false;
    private visibilityOwnerFlag: boolean;
    private visibilityInstitutionFlag: boolean;
    private visibilityAllLabMembersFlag: boolean;
    private visibilityPublicFlag: boolean;

    private showLabComboBox: boolean = false;
    private showLabMultiSelectComboBox: boolean = false;
    private multiSelectIdLabs: Set<string> = new Set<string>();
    private labList: any[] = [];
    private idLabString: string;
    private ownerList: any[] = [];
    private showOwnerComboBox: boolean = false;
    private showLabMembersComboBox: boolean = false;
    private labMembersList: any[] = [];
    private idAppUserString: string;

    private showBillingAccountComboBox: boolean = false;
    private idBillingAccountString: string;
    private billingAccountList: any[] = [];

    private showEmptyFoldersCheckbox: boolean = false;
    private showEmptyFoldersCheckboxLabel: string = this.SHOW_EMPTY_FOLDERS;
    private showEmptyFoldersFlag: boolean;

    constructor(private labListService: LabListService, private getLabService: GetLabService,
                private appUserListService: AppUserListService, private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private experimentsService: ExperimentsService, private analysisService: AnalysisService, private dataTrackService: DataTrackService,
                private dictionaryService: DictionaryService, private billingService: BillingService) {
        this.showMore = false;
        this.resetFields();
    }

    ngOnInit() {
        let isAdminState: boolean = this.createSecurityAdvisorService.isSuperAdmin || this.createSecurityAdvisorService.isAdmin;
        let isBillingAdminState: boolean = this.createSecurityAdvisorService.isBillingAdmin;
        let isGuestState: boolean = this.createSecurityAdvisorService.isGuest;
        if (this.mode === this.EXPERIMENT_BROWSE) {
            if (isAdminState) {
                this.showAllCheckbox = true;
                this.showLabComboBox = true;
                this.showOwnerComboBox = true;
                this.showDateRangePicker = true;
                this.showMoreSwitch = true;
                this.showExternalExperimentsCheckbox = true;
                this.showCoreFacilityComboBox = true;
                this.showRequestCategoryComboBox = true;
                this.showCCNumberInput = true;
                this.showEmptyFoldersCheckbox = true;

                this.labListService.getLabList().subscribe((response: any[]) => {
                    this.labList = response;
                });
            } else if (isGuestState) {
                this.showMoreSwitch = true;
                this.showMore = true;
                this.showEmptyFoldersCheckbox = true;
            } else {
                this.showExperimentsRadioGroup = true;
                this.showDateRangePicker = true;
                this.showMoreSwitch = true;
                this.showExternalExperimentsCheckbox = true;
                this.showLabMembersComboBox = true;
                this.showCoreFacilityComboBox = true;
                this.showRequestCategoryComboBox = true;
                this.showCCNumberInput = true;
                this.showEmptyFoldersCheckbox = true;

                this.appUserListService.getMembersOnly().subscribe((response: any[]) => {
                    this.labMembersList = response;
                });
            }
            this.coreFacilityList = this.createSecurityAdvisorService.myCoreFacilities;
        } else if (this.mode === this.ORDER_BROWSE) {
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
            }
        } else if (this.mode === this.ANALYSIS_BROWSE) {
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

                this.labListService.getLabList().subscribe((response: any[]) => {
                    this.labList = response;
                });
            } else if (isGuestState) {
                this.showDateRangePicker = true;
                this.showSearchTextInput = true;
                this.showOrganismComboBox = true;
                this.showGenomeBuildComboBox = true;
            } else {
                this.showDateRangePicker = true;
                this.showSearchTextInput = true;
                this.showAnalysesRadioGroup = true;
                this.showOrganismComboBox = true;
                this.showGenomeBuildComboBox = true;
                this.showMoreSwitch = true;

                this.showMore = true;
            }

            this.organismList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ORGANISM);
        } else if (this.mode === this.DATA_TRACK_BROWSE) {
            if (isAdminState) {
                this.showOrganismComboBox = true;
                this.showGenomeBuildComboBox = true;
                this.showLabComboBox = true;
                this.showVisibilityCheckboxes = true;

                this.labListService.getLabList().subscribe((response: any[]) => {
                    this.labList = response;
                });
            } else if (isGuestState) {
                this.showOrganismComboBox = true;
                this.showGenomeBuildComboBox = true;
            } else {
                this.showOrganismComboBox = true;
                this.showGenomeBuildComboBox = true;
                this.showVisibilityCheckboxes = true;
            }

            this.organismList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ORGANISM);
        } else if (this.mode === this.BILLING_BROWSE) {
            if (isAdminState || isBillingAdminState) {
                this.showMoreSwitch = true;
                this.showMore = true;

                this.showLabComboBox = true;
                this.showExperimentNumberInput = true;
                this.showInvoiceNumberInput = true;
                this.showBillingAccountComboBox = true;
                this.showEmptyFoldersCheckbox = true;
                this.showEmptyFoldersCheckboxLabel = this.HIDE_REQUESTS_WITH_NO_BILLING_ITEMS;

                this.coreFacilityList = this.createSecurityAdvisorService.myCoreFacilities;
                if (this.coreFacilityList.length === 1) {
                    let event: any = {args: {item: {value: this.coreFacilityList[0].idCoreFacility}}};
                    this.onCoreFacilitySelect(event);
                } else {
                    this.showCoreFacilityComboBox = true;
                }
            }
        }
    }

    resetFields(): void {
        this.allFlag = false;
        this.experimentsRadioString = "myLab";
        this.analysesRadioString = "myLab";
        this.workflowStateString = "SUBMITTED";
        this.redosFlag = false;
        this.orderNumberString = "";
        this.idLabString = "";
        this.idBillingAccountString = "";
        this.multiSelectIdLabs.clear();
        this.ownerList = [];
        this.idAppUserString = "";
        this.dateFromString = "";
        this.dateToString = "";
        this.searchText = "";
        this.externalExperimentsFlag = false;
        this.publicFlag = false;
        this.idCoreFacilityString = "";
        this.coreFacilityList = [];
        this.codeRequestCategoryString = "";
        this.idOrganismString = "";
        this.idGenomeBuildString = "";
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

    toggleShowMore(): void {
        this.showMore = !this.showMore;
        if (!this.showMore) {
            this.multiSelectIdLabs.clear();
            this.resetCoreFacilitySelection();
            if (this.showLabMembersComboBox) {
                this.idAppUserString = "";
            }
        }
    }

    resetLabSelection(): void {
        this.idLabString = "";
        this.idAppUserString = "";
        this.idBillingAccountString = "";
        this.ownerList = [];
        this.billingAccountList = [];
    }

    onLabSelect(event: any): void {
        if (event.args) {
            if (event.args.item && event.args.item.value) {
                this.idLabString = event.args.item.value;
                if (this.showOwnerComboBox) {
                    this.getLabService.getLabByIdOnlyForHistoricalOwnersAndSubmitters(this.idLabString).subscribe((response: any) => {
                        this.ownerList = response.Lab.historicalOwnersAndSubmitters;
                    });
                }
                if (this.showBillingAccountComboBox && this.mode === this.BILLING_BROWSE) {
                    this.getLabService.getLabBillingAccounts(this.idLabString).subscribe((response: any) => {
                        let allBillingAccounts: any[] = response.Lab.billingAccounts;
                        this.billingAccountList = allBillingAccounts.filter(account => {
                            return account.idCoreFacility === this.idCoreFacilityString;
                        });
                    });
                }
            } else {
                this.resetLabSelection();
            }
        }
    }

    onLabUnselect(): void {
        this.resetLabSelection();
    }

    onMultiLabSelect(event: any): void {
        if (event.args != undefined && event.args.item != null && event.args.item.value != null) {
            this.multiSelectIdLabs.add(event.args.item.value);
        }
    }

    onMultiLabUnselect(event: any): void {
        if (event.args != undefined && event.args.item != null && event.args.item.value != null) {
            this.multiSelectIdLabs.delete(event.args.item.value);
        }
    }

    onAppUserSelect(event: any): void {
        if (event.args != undefined && event.args.item != null && event.args.item.value != null) {
            this.idAppUserString = event.args.item.value;
        } else {
            this.idAppUserString = "";
        }
    }

    onAppUserUnselect(): void {
        this.idAppUserString = "";
    }

    onBillingAccountSelect(event: any): void {
        if (event.args != undefined && event.args.item != null && event.args.item.value != null) {
            this.idBillingAccountString = event.args.item.value;
        } else {
            this.idBillingAccountString = "";
        }
    }

    onBillingAccountUnselect(): void {
        this.idBillingAccountString = "";
    }

    onCoreFacilitySelect(event: any): void {
        if (event.args != undefined && event.args.item != null && event.args.item.value != null) {
            this.idCoreFacilityString = event.args.item.value;
            if (this.showRequestCategoryComboBox) {
                let requestCategories = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY);
                this.requestCategoryList = requestCategories.filter(cat => {
                    if (cat.isActive === "Y" && !(cat.value === "") && cat.isInternal === "Y") {
                        return cat.idCoreFacility === this.idCoreFacilityString;
                    }
                    return false;
                });
            }
            if (this.mode === this.BILLING_BROWSE) {
                this.labListService.getLabList().subscribe((response: any[]) => {
                    this.labList = response.filter(lab => {
                        if (lab.coreFacilities.length === undefined && !(lab.coreFacilities.CoreFacility === undefined)) {
                            return lab.coreFacilities.CoreFacility.idCoreFacility === this.idCoreFacilityString;
                        } else if (!(lab.coreFacilities.length === undefined)) {
                            let index: number;
                            for (index = 0; index < lab.coreFacilities.length; index++) {
                                if (lab.coreFacilities[index].idCoreFacility === this.idCoreFacilityString) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    });
                });
            }
        } else {
            this.resetCoreFacilitySelection();
        }
    }

    onCoreFacilityUnselect(): void {
        this.resetCoreFacilitySelection();
    }

    resetCoreFacilitySelection(): void {
        if (!(this.mode === this.BILLING_BROWSE && !this.showCoreFacilityComboBox)) {
            this.idCoreFacilityString = "";
            this.codeRequestCategoryString = "";
            this.requestCategoryList = [];
            if (this.mode === this.BILLING_BROWSE) {
                this.resetLabSelection();
            }
        }
    }

    onOrganismSelect(event: any): void {
        if (event.args != undefined && event.args.item != null && event.args.item.value != null) {
            this.idOrganismString = event.args.item.value;
            if (this.showGenomeBuildComboBox) {
                let genomeBuilds = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.GENOME_BUILD);
                this.genomeBuildList = genomeBuilds.filter(gen => {
                    if (gen.isActive === "Y" && !(gen.value === "")) {
                        return gen.idOrganism === this.idOrganismString;
                    }
                    return false;
                });
            }
        } else {
            this.resetOrganismSelection();
        }
    }

    onOrganismUnselect(): void {
        this.resetOrganismSelection();
    }

    resetOrganismSelection(): void {
        this.idOrganismString = "";
        this.idGenomeBuildString = "";
        this.genomeBuildList = [];
    }

    onGenomeBuildSelect(event: any): void {
        if (event.args != undefined && event.args.item != null && event.args.item.value != null) {
            this.idGenomeBuildString = event.args.item.value;
        } else {
            this.idGenomeBuildString = "";
        }
    }

    onGenomeBuildUnselect(): void {
        this.idGenomeBuildString = "";
    }

    onRequestCategorySelect(event: any): void {
        if (event.args != undefined && event.args.item != null && event.args.item.value != null) {
            this.codeRequestCategoryString = event.args.item.value;
        } else {
            this.codeRequestCategoryString = "";
        }
    }

    onRequestCategoryUnselect(): void {
        this.codeRequestCategoryString = "";
    }

    onExperimentsRadioGroupChange(): void {
        if (this.showExperimentsRadioGroup && this.showLabMembersComboBox && !(this.experimentsRadioString === "myLab")) {
            this.idAppUserString = "";
        }
    }

    getExperimentBrowseParameters(): URLSearchParams {
        let params: URLSearchParams = new URLSearchParams();

        if (this.showCoreFacilityComboBox && !(this.idCoreFacilityString === "")) {
            params.set("idCoreFacility", this.idCoreFacilityString);

            if (this.showRequestCategoryComboBox && !(this.codeRequestCategoryString === "")) {
                params.set("codeRequestCategory", this.codeRequestCategoryString);
            }
        }

        if (this.showCCNumberInput && !(this.ccNumberString === "")) {
            params.set("ccNumber", this.ccNumberString);
        }

        if (this.showAllCheckbox && this.allFlag) {
            params.set("allExperiments", "Y");
        } else {
            if (this.showLabComboBox && !(this.idLabString === "")) {
                params.set("idLab", this.idLabString);
            }
            if (this.showOwnerComboBox && !(this.idAppUserString === "")) {
                params.set("idAppUser", this.idAppUserString);
            }
            if (this.showExperimentsRadioGroup) {
                if (this.experimentsRadioString === "myExperiments") {
                    params.set("idAppUser", this.createSecurityAdvisorService.idAppUser.toString());
                } else if (this.experimentsRadioString === "myLab" && this.showLabMembersComboBox && !(this.idAppUserString === "")) {
                    params.set("idAppUser", this.idAppUserString);
                } else if (this.experimentsRadioString === "myCollaborations") {
                    params.set("allCollaborations", "Y");
                    params.set("idAppUser", this.createSecurityAdvisorService.idAppUser.toString());
                } else if (this.experimentsRadioString === "all") {
                    params.set("allExperiments", "Y");
                }
                params.set("publicExperimentsInOtherGroups", this.experimentsRadioString === "publicData" ? "Y" : "N");
            }
            if (this.showExternalExperimentsCheckbox && this.externalExperimentsFlag) {
                params.set("isExternalOnly", "Y");
            }
            params.set("showMyLabsAlways", this.createSecurityAdvisorService.isSuperAdmin || this.createSecurityAdvisorService.isAdmin ? "N" : "Y");
        }

        if (this.showDateRangePicker && !(this.dateFromString === "") && !(this.dateToString === "")) {
            params.set("createDateFrom", this.dateFromString);
            params.set("createDateTo", this.dateToString);
        }

        if (this.showEmptyFoldersCheckbox && this.showEmptyFoldersFlag) {
            params.set("showEmptyProjectFolders", "Y");
        } else {
            params.set("showEmptyProjectFolders", "N");
        }

        params.set("showSamples", "N");
        params.set("showCategory", "N");

        return params;
    }

    getOrderBrowseParameters(): URLSearchParams {
        let params: URLSearchParams = new URLSearchParams();

        params.set("includeSampleInfo", "Y");

        if (this.showDateRangePicker && !(this.dateFromString === "") && !(this.dateToString === "")) {
            params.set("createDateFrom", this.dateFromString);
            params.set("createDateTo", this.dateToString);
        }

        if (this.showOrderNumberInput && !(this.orderNumberString === "")) {
            params.set("number", this.orderNumberString);
            this.workflowStateString = "";
        }

        if (this.showWorkflowStateRadioGroup && !(this.workflowStateString === "")) {
            params.set("status", this.workflowStateString);
        }

        if (this.showRedosCheckbox && this.redosFlag) {
            params.set("hasRedo", "Y");
        }

        if (this.showCoreFacilityComboBox && !(this.idCoreFacilityString === "")) {
            params.set("idCoreFacility", this.idCoreFacilityString);

            if (this.showRequestCategoryComboBox && !(this.codeRequestCategoryString === "")) {
                params.set("codeRequestCategory", this.codeRequestCategoryString);
            }
        }

        return params;
    }

    getAnalysisBrowseParameters(): URLSearchParams {
        let params: URLSearchParams = new URLSearchParams();

        if (this.showAllCheckbox && this.allFlag) {
            params.set("allAnalysis", "Y");
        } else {
            if (this.showAnalysesRadioGroup) {
                if (this.analysesRadioString === "all") {
                    params.set("allAnalysis", "Y");
                } else if (this.analysesRadioString === "myAnalyses") {
                    params.set("idAppUser", this.createSecurityAdvisorService.idAppUser.toString());
                } else if (this.analysesRadioString === "otherLabs") {
                    params.set("publicAnalysisOtherGroups", "Y");
                }
            }

            params.set("showMyLabsAlways", this.createSecurityAdvisorService.isSuperAdmin || this.createSecurityAdvisorService.isAdmin ? "N" : "Y");

            if (this.createSecurityAdvisorService.isGuest || (this.showPublicCheckbox && this.publicFlag)) {
                params.set("publicProjects", "Y");
            }

            if (this.showDateRangePicker && !(this.dateFromString === "") && !(this.dateToString === "")) {
                params.set("createDateFrom", this.dateFromString);
                params.set("createDateTo", this.dateToString);
            }

            if (this.showSearchTextInput && !(this.searchText === "")) {
                params.set("searchText", this.searchText);
            }

            if (this.showLabMultiSelectComboBox && this.multiSelectIdLabs.size > 0) {
                let labKeys: string = "";
                this.multiSelectIdLabs.forEach(function (lab: string) {
                    if (labKeys === "") {
                        labKeys = labKeys.concat(lab);
                    } else {
                        labKeys = labKeys.concat(":", lab);
                    }
                }, this);
                params.set("labKeys", labKeys);
            }

            if (this.showOrganismComboBox && !(this.idOrganismString === "")) {
                params.set("idOrganism", this.idOrganismString);
                if (this.showGenomeBuildComboBox && !(this.idGenomeBuildString === "")) {
                    params.set("idGenomeBuild", this.idGenomeBuildString);
                }
            }
        }

        return params;
    }

    getDataTrackBrowseParameters(): URLSearchParams {
        let params: URLSearchParams = new URLSearchParams();

        if (this.showLabComboBox && !(this.idLabString === "")) {
            params.set("idLab", this.idLabString);
        }

        if (this.showOrganismComboBox && !(this.idOrganismString === "")) {
            params.set("idOrganism", this.idOrganismString);
            if (this.showGenomeBuildComboBox && !(this.idGenomeBuildString === "")) {
                params.set("idGenomeBuild", this.idGenomeBuildString);
            }
        }

        if (this.showVisibilityCheckboxes) {
            params.set("isVisibilityPublic", this.visibilityPublicFlag ? "Y" : "N");
            params.set("isVisibilityOwner", this.visibilityOwnerFlag ? "Y" : "N");
            params.set("isVisibilityMembers", this.visibilityAllLabMembersFlag ? "Y" : "N");
            params.set("isVisibilityInstitute", this.visibilityInstitutionFlag ? "Y" : "N");
        }

        return params;
    }

    getBillingRequestListParameters(): URLSearchParams {
        // TODO Need to look up property for excludeNewRequest parameter
        //<excludeNewRequests>{coreFacilityCombo.selectedItem != null &amp;&amp;parentApplication.getCoreFacilityProperty(coreFacilityCombo.selectedItem.@value, parentApplication.PROPERTY_EXCLUDE_NEW_REQUESTS) == "Y" ? 'Y' : 'N'}</excludeNewRequests>

        let params: URLSearchParams = new URLSearchParams();

        if (this.showLabComboBox && !(this.idLabString === "")) {
            params.set("idLab", this.idLabString);
        }
        if (this.showBillingAccountComboBox && !(this.idBillingAccountString === "")) {
            params.set("idBillingAccount", this.idBillingAccountString);
        }
        if ((this.showCoreFacilityComboBox && !(this.idCoreFacilityString === "")) || this.coreFacilityList.length === 1) {
            params.set("idCoreFacility", this.idCoreFacilityString);
        }
        params.set("excludeInactiveBillingTemplates", "Y");
        params.set("deepSortResults", "Y");
        params.set("excludeNewRequests", "N");

        return params;
    }

    getBillingItemListParameters(): URLSearchParams {
        // TODO Need to look up property for excludeNewRequest parameter
        //<excludeNewRequests>{coreFacilityCombo.selectedItem != null &amp;&amp;parentApplication.getCoreFacilityProperty(coreFacilityCombo.selectedItem.@value, parentApplication.PROPERTY_EXCLUDE_NEW_REQUESTS) == "Y" ? 'Y' : 'N'}</excludeNewRequests>

        let params: URLSearchParams = new URLSearchParams();

        if (this.showExperimentNumberInput && !(this.experimentNumberString === "")) {
            params.set("requestNumber", this.experimentNumberString);
        }
        if (this.showInvoiceNumberInput && !(this.invoiceNumberString === "")) {
            params.set("invoiceNumber", this.invoiceNumberString);
        }
        if (this.showEmptyFoldersCheckbox) {
            params.set("showOtherBillingItems", this.showEmptyFoldersFlag ? "Y" : "N");
        }
        if (this.showLabComboBox && !(this.idLabString === "") && (this.experimentNumberString === "" && this.invoiceNumberString === "")) {
            params.set("idLab", this.idLabString);
        }
        if (this.showBillingAccountComboBox && !(this.idBillingAccountString === "")) {
            params.set("idBillingAccount", this.idBillingAccountString);
        }
        if ((this.showCoreFacilityComboBox && !(this.idCoreFacilityString === "")) || this.coreFacilityList.length === 1) {
            params.set("idCoreFacility", this.idCoreFacilityString);
        }
        params.set("excludeInactiveBillingTemplates", "Y");
        params.set("sortResults", "N");
        params.set("excludeNewRequests", "N");

        return params;
    }

    getBillingInvoiceListParameters(): URLSearchParams {
        // TODO Need to look up property for excludeNewRequest parameter
        //<excludeNewRequests>{coreFacilityCombo.selectedItem != null &amp;&amp;parentApplication.getCoreFacilityProperty(coreFacilityCombo.selectedItem.@value, parentApplication.PROPERTY_EXCLUDE_NEW_REQUESTS) == "Y" ? 'Y' : 'N'}</excludeNewRequests>

        let params: URLSearchParams = new URLSearchParams();
        let noRequestOrInvoiceNumber: boolean = this.experimentNumberString === "" && this.invoiceNumberString === "";

        if (this.showExperimentNumberInput && !(this.experimentNumberString === "")) {
            params.set("requestNumber", this.experimentNumberString);
        }
        if (this.showInvoiceNumberInput && !(this.invoiceNumberString === "")) {
            params.set("invoiceNumber", this.invoiceNumberString);
        }
        if (this.showLabComboBox && !(this.idLabString === "") && noRequestOrInvoiceNumber) {
            params.set("idLab", this.idLabString);
        }
        if (((this.showCoreFacilityComboBox && !(this.idCoreFacilityString === "")) || this.coreFacilityList.length === 1) && noRequestOrInvoiceNumber) {
            params.set("idCoreFacility", this.idCoreFacilityString);
        }
        params.set("excludeNewRequests", "N");

        return params;
    }

    search(): void {
        if (this.mode === this.EXPERIMENT_BROWSE) {
            let params: URLSearchParams = this.getExperimentBrowseParameters();
            this.experimentsService.browsePanelParams = params;
            this.experimentsService.browsePanelParams["refreshParams"] = true;
            this.experimentsService.getProjectRequestList_fromBackend(params);
        } else if (this.mode === this.ORDER_BROWSE) {
            let params: URLSearchParams = this.getOrderBrowseParameters();
            this.experimentsService.getExperiments_fromBackend(params);
        } else if (this.mode === this.ANALYSIS_BROWSE) {
            let params: URLSearchParams = this.getAnalysisBrowseParameters();
            this.analysisService.analysisPanelParams = params;
            this.analysisService.analysisPanelParams["refreshParams"] = true;
            this.analysisService.getAnalysisGroupList_fromBackend(params);
                console.log("GetAnalysisGroupList called");
        } else if (this.mode === this.DATA_TRACK_BROWSE) {
            let params: URLSearchParams = this.getDataTrackBrowseParameters();
            this.dataTrackService.previousURLParams = params;
            this.dataTrackService.previousURLParams["refreshParams"] = true;
            this.dataTrackService.labList = this.labList;
            this.dataTrackService.getDatatracksList_fromBackend(params);
        } else if (this.mode === this.BILLING_BROWSE) {
            let billingRequestListParams: URLSearchParams = this.getBillingRequestListParameters();
            this.billingService.getBillingRequestListDep(billingRequestListParams).subscribe((response: any) => {
                console.log("GetBillingRequestList called");
            });

            let billingItemListParams: URLSearchParams = this.getBillingItemListParameters();
            this.billingService.getBillingItemListDep(billingItemListParams).subscribe((response: any) => {
                console.log("GetBillingItemList called");
            });

            let billingInvoiceListParams: URLSearchParams = this.getBillingInvoiceListParameters();
            this.billingService.getBillingInvoiceListDep(billingInvoiceListParams).subscribe((response: any) => {
                console.log("GetBillingInvoiceList called");
            });
        }
    }
}

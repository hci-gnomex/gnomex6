import {Component, Input} from "@angular/core";
import {Response, URLSearchParams} from "@angular/http";
import {DictionaryService} from "../services/dictionary.service";
import {PropertyService} from "../services/property.service";
import {ActivatedRoute, Params} from "@angular/router";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ConstantsService} from "../services/constants.service";
import {DialogsService} from "./popup/dialogs.service";
import {MatSnackBar} from "@angular/material";
import {ExperimentPlatformService} from "../services/experiment-platform.service";
import {first, take} from "rxjs/operators";

@Component({
    selector: 'configure-annotations',
    templateUrl: "./configure-annotations.component.html",
})

export class ConfigureAnnotationsComponent {
    public readonly SHOW_FOR_SAMPLES: string = "s";
    public readonly SHOW_FOR_ANALYSIS: string = "a";
    public readonly SHOW_FOR_DATA_TRACKS: string = "dt";
    public readonly SHOW_FOR_EXPERIMENTS: string = "e";
    public readonly TYPE_TEXT: string = "TEXT";
    public readonly TYPE_URL: string = "URL";
    public readonly TYPE_CHECKBOX: string = "CHECK";
    public readonly TYPE_OPTION: string = "OPTION";
    public readonly TYPE_MULTI_OPTION: string = "MOPTION";
    public experimentPlatformMode:boolean = false;
    @Input() public orderType: string = "";
    public listOrganism: any[] = [];
    public idOrganism: string;
    public listExperimentPlatform: any[] = [];
    public listFilteredExperimentPlatform: any[] = [];
    public listApplication: any[] = [];
    public listFilteredApplication: any[] = [];
    public appliesToPlatform: FormControl;
    public appliesToApp: any;
    public appliesToOrganism: any;
    public appliesToAnalysisType: any;
    public appliesToUser: any;
    public requestCategory: string;
    private expPlatform:any;
    public listAnalysisType: any[] = [];
    public idAnalysisType: string;
    public allProps: any[] = [];
    private idCoreFacility: string = null;
    public myCoreFacilities: any[] = [];
    public selectedProperty: any;
    public canUpdateSelectedProperty: boolean = false;
    public appUserList: any[] = [];
    public selectedTabIndex: number = 0;
    public showSpinner: boolean = false;

    public annotGridColumnDefs: any[];
    public annotGridRowData: any[];
    public annotGridApi: any;
    public annotGridRowClassRules: any;

    public optionGridColumnDefs: any[];
    public currentOptions: any[] = [];
    public optionGridApi: any;
    public selectedOptionIndex: any = null;

    public platformGridColumnDefs: any[];
    public currentPlatforms: any[] = [];
    public platformGridApi: any;
    public selectedPlatformIndex: any = null;

    public organismGridColumnDefs: any[];
    public currentOrganisms: any[] = [];
    public organismGridApi: any;
    public selectedOrganismIndex: any = null;

    public analysisTypeGridColumnDefs: any[];
    public currentAnalysisTypes: any[] = [];
    public analysisTypeGridApi: any;
    public selectedAnalysisTypeIndex: any = null;

    public userGridColumnDefs: any[];
    public currentUsers: any[] = [];
    public userGridApi: any;
    public selectedUserIndex: any = null;

    public formGroup: FormGroup;
    public nameFC: FormControl;
    public activeFC: FormControl;
    public coreFacilityFC: FormControl;
    public forSampleFC: FormControl;
    public forDataTrackFC: FormControl;
    public forAnalysisFC: FormControl;
    public forRequestFC: FormControl;
    public requiredFC: FormControl;
    public sortOrderFC: FormControl;
    public descriptionFC: FormControl;
    public ownerFC: FormControl;
    public propertyTypeFC: FormControl;
    public mageOntologyCodeFC: FormControl;
    public mageOntologyDefFC: FormControl;



    constructor(private dictionaryService: DictionaryService,
                private propertyService: PropertyService,
                private route: ActivatedRoute,
                public createSecurityAdvisorService: CreateSecurityAdvisorService,
                private constantsService: ConstantsService,
                private dialogsService: DialogsService,
                private snackBar: MatSnackBar,
                private expPlatformService:ExperimentPlatformService) {
        this.annotGridColumnDefs = [
            {headerName: "Annotation", field: "name", width: 100, valueFormatter: this.annotFormatter},
        ];
        this.annotGridRowData = [];
        this.annotGridRowClassRules = {
            "annotationRequiredRow": "data.isActive === 'Y' && data.isRequired === 'Y'",
            "annotationActiveRow": "data.isActive === 'Y' && data.isRequired === 'N'",
            "annotationInactiveRow": "data.isActive === 'N'"
        };

        this.optionGridColumnDefs = [
            {headerName: "Option", field: "option", width: 10, editable: this.determineEditable},
            {headerName: "Order", field: "sortOrder", width: 10, editable: this.determineEditable},
            {headerName: "Active", field: "isActive", width: 10, editable: this.determineEditable, valueParser: this.activeValueParser},
        ];
        this.platformGridColumnDefs = [
            {headerName: "Platform", field: "display", width: 10},
            {headerName: "Experiment Type", field: "applicationDisplay", width: 10},
        ];
        this.organismGridColumnDefs = [
            {headerName: "Organism", field: "display", width: 10},
        ];
        this.analysisTypeGridColumnDefs = [
            {headerName: "Analysis Type", field: "display", width: 10},
        ];
        this.userGridColumnDefs = [
            {headerName: "User", field: "display", width: 10},
        ];

        route.params.subscribe((params: Params) => {
            if (params && params["idCoreFacility"]) {
                this.idCoreFacility = params["idCoreFacility"];
            }
        });
        this.myCoreFacilities = this.createSecurityAdvisorService.myCoreFacilities;
        this.listOrganism = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ORGANISM);
        this.listExperimentPlatform = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY);
        this.listAnalysisType = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ANALYSIS_TYPE);
        this.listApplication = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.APPLICATION);
        this.refreshPropertyList();
        this.appUserList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.APP_USER);

        this.nameFC = new FormControl("", Validators.required);
        this.activeFC = new FormControl(false);
        this.coreFacilityFC = new FormControl("", Validators.required);
        this.forSampleFC = new FormControl(false);
        this.forDataTrackFC = new FormControl(false);
        this.forAnalysisFC = new FormControl(false);
        this.forRequestFC = new FormControl(false);
        this.requiredFC = new FormControl(false);
        this.sortOrderFC = new FormControl("", Validators.pattern("^[0-9]{0,4}$"));
        this.descriptionFC = new FormControl("", Validators.maxLength(2000));
        this.ownerFC = new FormControl({value: "", disabled: !this.createSecurityAdvisorService.hasPermission("canWriteDictionaries")});
        this.propertyTypeFC = new FormControl("");
        this.mageOntologyCodeFC = new FormControl("");
        this.mageOntologyDefFC = new FormControl("");

        this.formGroup = new FormGroup({
            name: this.nameFC,
            active: this.activeFC,
            coreFacility: this.coreFacilityFC,
            forSample: this.forSampleFC,
            forDataTrack: this.forDataTrackFC,
            forAnalysis: this.forAnalysisFC,
            forRequest: this.forRequestFC,
            required: this.requiredFC,
            sortOrder: this.sortOrderFC,
            description: this.descriptionFC,
            owner: this.ownerFC,
            propertyType: this.propertyTypeFC,
            mageOntologyCode: this.mageOntologyCodeFC,
            mageOntologyDef: this.mageOntologyDefFC,
        });

        this.appliesToPlatform = new FormControl("");
        this.coreFacilityFC.valueChanges.subscribe(() => {
            this.refreshListFilteredExperimentPlatform();
        });
        this.appliesToPlatform.valueChanges.subscribe(() => {
            this.refreshListFilteredApplication();
        });
    }

    private annotFormatter(params: any) {
        let data: any = params.data;
        if (data.appliesToAnalysisType != '' || data.appliesToAppUser != '' || data.appliesToOrganism != '' || data.appliesToRequestCategory != '') {
            return "*" + params.value;
        } else {
            return params.value;
        }
    }

    private determineEditable(params: any): boolean {
        return params.node.data.canUpdate === "Y";
    }

    private activeValueParser(params: any): string {
        let newValue: string = params.newValue.toUpperCase();
        if (newValue === "Y" || newValue === "YES" || newValue === "T" || newValue === "TRUE") {
            return "Y";
        } else {
            return "N";
        }
    }

    private updateDisplayedProperties(): void {
        this.annotGridRowData = this.allProps.filter((prop: any) => {
            let coreMatch: boolean = false;
            if (this.idCoreFacility && this.idCoreFacility === prop.idCoreFacility) {
                coreMatch = true;
            } else {
                for (let core of this.myCoreFacilities) {
                    if (prop.idCoreFacility === core.idCoreFacility) {
                        coreMatch = true;
                        break;
                    }
                }
            }
            if (!coreMatch) {
                return false;
            }
            let criteriaMatch: boolean = false;
            if(!this.experimentPlatformMode){
                if (this.orderType === "") {
                    criteriaMatch = true;
                } else if (this.orderType === this.SHOW_FOR_SAMPLES && prop.forSample === "Y") {
                    criteriaMatch = true;
                } else if (this.orderType === this.SHOW_FOR_ANALYSIS && prop.forAnalysis === "Y") {
                    criteriaMatch = true;
                } else if (this.orderType === this.SHOW_FOR_DATA_TRACKS && prop.forDataTrack === "Y") {
                    criteriaMatch = true;
                } else if (this.orderType === this.SHOW_FOR_EXPERIMENTS && prop.forRequest === "Y") {
                    criteriaMatch = true;
                }

            }else{
                criteriaMatch = this.orderType === this.SHOW_FOR_EXPERIMENTS && prop.forRequest === "Y";
            }
            if (!criteriaMatch) {
                return false;
            }


            if (this.idOrganism && this.idOrganism != "" && !ConfigureAnnotationsComponent.hasMatchInList(this.idOrganism, prop.appliesToOrganism)) {
                return false;
            }
            if (this.idAnalysisType && this.idAnalysisType != "" && !ConfigureAnnotationsComponent.hasMatchInList(this.idAnalysisType, prop.appliesToAnalysisType)) {
                return false;
            }
            if (this.requestCategory && this.requestCategory != "" && !ConfigureAnnotationsComponent.hasMatchInList(this.requestCategory, prop.appliesToRequestCategory)) {
                return false;
            }

            return true;
        });
    }

    private refreshListFilteredExperimentPlatform(): void {
        this.listFilteredExperimentPlatform = this.listExperimentPlatform.filter((plat: any) => {
            return plat.idCoreFacility === this.coreFacilityFC.value;
        });
    }

    private refreshListFilteredApplication(): void {
        this.listFilteredApplication = this.listApplication.filter((app: any) => {
            if (this.appliesToPlatform.value) {
                if (app.isActive === "N") {
                    return false;
                }
                let theApplications: any[] = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY_APPLICATION).filter((a: any) => {
                    return a.codeApplication === app.codeApplication;
                });
                for (let a of theApplications) {
                    if (a.codeRequestCategory === this.appliesToPlatform.value.codeRequestCategory) {
                        return true;
                    }
                }
            }
            return false;
        });
    }

    public addOption(): void {
        let opt: any = {};
        opt.idPropertyOption = "PropertyOption" + this.currentOptions.length;
        opt.option = "enter option here...";
        opt.isActive = "Y";
        opt.sortOrder = (this.currentOptions.length + 1).toString();
        opt.canUpdate = "Y";
        this.currentOptions.push(opt);
        this.optionGridApi.setRowData(this.currentOptions);
        this.formGroup.markAsDirty();
    }

    public deleteOption(): void {
        if (this.canUpdateSelectedProperty && this.selectedOptionIndex != null) {
            this.currentOptions.splice(this.selectedOptionIndex, 1);
            this.optionGridApi.setRowData(this.currentOptions);
            this.selectedOptionIndex = null;
            this.formGroup.markAsDirty();
        }
    }

    public cellEditingStarted(): void {
        this.formGroup.markAsDirty();
    }

    public addPlatform(): void {
        if (this.canUpdateSelectedProperty && this.appliesToPlatform.value) {
            let codeRequestCategory: string = this.appliesToPlatform.value.codeRequestCategory;
            let codeApplication: string = "";
            let applicationDisplay: string = "";
            if (this.appliesToApp) {
                codeApplication = this.appliesToApp.codeApplication;
                applicationDisplay = this.appliesToApp.application;
            }

            for (let currentPlat of this.currentPlatforms) {
                if (currentPlat.codeRequestCategory === codeRequestCategory && currentPlat.codeApplication === codeApplication) {
                    // Already in list
                    return;
                }
            }

            let plat: any = {};
            plat.idProperty = this.selectedProperty.idProperty;
            plat.codeRequestCategory = codeRequestCategory;
            plat.display = this.appliesToPlatform.value.display;
            plat.codeApplication = codeApplication;
            plat.applicationDisplay = applicationDisplay;

            this.currentPlatforms.push(plat);
            this.platformGridApi.setRowData(this.currentPlatforms);
            this.formGroup.markAsDirty();
        }
    }

    public deletePlatform(): void {
        if (this.canUpdateSelectedProperty && this.selectedPlatformIndex != null) {
            this.currentPlatforms.splice(this.selectedPlatformIndex, 1);
            this.platformGridApi.setRowData(this.currentPlatforms);
            this.selectedPlatformIndex = null;
            this.formGroup.markAsDirty();
        }
    }

    public addOrganism(): void {
        if (this.canUpdateSelectedProperty && this.appliesToOrganism) {
            for (let currentOrg of this.currentOrganisms) {
                if (currentOrg.idOrganism === this.appliesToOrganism.idOrganism) {
                    // Already in list
                    return;
                }
            }

            this.currentOrganisms.push(this.appliesToOrganism);
            this.organismGridApi.setRowData(this.currentOrganisms);
            this.appliesToOrganism = null;
            this.formGroup.markAsDirty();
        }
    }

    public deleteOrganism(): void {
        if (this.canUpdateSelectedProperty && this.selectedOrganismIndex != null) {
            this.currentOrganisms.splice(this.selectedOrganismIndex, 1);
            this.organismGridApi.setRowData(this.currentOrganisms);
            this.selectedOrganismIndex = null;
            this.formGroup.markAsDirty();
        }
    }

    public addAnalysisType(): void {
        if (this.canUpdateSelectedProperty && this.appliesToAnalysisType) {
            for (let currentAn of this.currentAnalysisTypes) {
                if (currentAn.idAnalysisType === this.appliesToAnalysisType.idAnalysisType) {
                    // Already in list
                    return;
                }
            }

            this.currentAnalysisTypes.push(this.appliesToAnalysisType);
            this.analysisTypeGridApi.setRowData(this.currentAnalysisTypes);
            this.appliesToAnalysisType = null;
            this.formGroup.markAsDirty();
        }
    }

    public deleteAnalysisType(): void {
        if (this.canUpdateSelectedProperty && this.selectedAnalysisTypeIndex != null) {
            this.currentAnalysisTypes.splice(this.selectedAnalysisTypeIndex, 1);
            this.analysisTypeGridApi.setRowData(this.currentAnalysisTypes);
            this.selectedAnalysisTypeIndex = null;
            this.formGroup.markAsDirty();
        }
    }

    public addUser(): void {
        if (this.canUpdateSelectedProperty && this.appliesToUser) {
            for (let currentU of this.currentUsers) {
                if (currentU.idAppUser === this.appliesToUser.idAppUser) {
                    // Already in list
                    return;
                }
            }

            this.currentUsers.push(this.appliesToUser);
            this.userGridApi.setRowData(this.currentUsers);
            this.appliesToUser = null;
            this.formGroup.markAsDirty();
        }
    }

    public deleteUser(): void {
        if (this.canUpdateSelectedProperty && this.selectedUserIndex != null) {
            this.currentUsers.splice(this.selectedUserIndex, 1);
            this.userGridApi.setRowData(this.currentUsers);
            this.selectedUserIndex = null;
            this.formGroup.markAsDirty();
        }
    }

    private static hasMatchInList(value: string, listArrayString: string): boolean {
        if (value && listArrayString) {
            let listArray: string[] = listArrayString.split(", ");
            for (let item of listArray) {
                if (item === value) {
                    return true;
                }
            }
        }
        return false;
    }

    private setProperty(prop: any): void {
        this.selectedProperty = prop;
        this.selectedOptionIndex = null;
        this.canUpdateSelectedProperty = prop ? prop.canUpdate === "Y" : false;
        this.currentOptions = prop ? Array.isArray(prop.options) ? prop.options : [prop.options.PropertyOption] : [];
        this.currentPlatforms = prop ? Array.isArray(prop.platformApplications) ? prop.platformApplications : [prop.platformApplications.PropertyPlatformApplication] : [];
        this.currentOrganisms = prop ? Array.isArray(prop.organisms) ? prop.organisms : [prop.organisms.Organism] : [];
        this.currentAnalysisTypes = prop ? Array.isArray(prop.analysisTypes) ? prop.analysisTypes : [prop.analysisTypes.AnalysisType] : [];
        this.currentUsers = prop ? Array.isArray(prop.appUsers) ? prop.appUsers : [prop.appUsers.AppUserLite] : [];
        this.nameFC.setValue(prop ? prop.name : "");
        this.activeFC.setValue(prop ? prop.isActive === "Y" : false);
        this.coreFacilityFC.setValue(prop ? prop.idCoreFacility : "");
        this.forSampleFC.setValue(prop ? prop.forSample === "Y" : false);
        this.forDataTrackFC.setValue(prop ? prop.forDataTrack === "Y" : false);
        this.forAnalysisFC.setValue(prop ? prop.forAnalysis === "Y" : false);
        this.forRequestFC.setValue(prop ? prop.forRequest === "Y" : false);
        this.requiredFC.setValue(prop ? prop.isRequired === "Y" : false);
        this.sortOrderFC.setValue(prop ? prop.sortOrder : "");
        this.descriptionFC.setValue(prop ? prop.description : "");
        this.ownerFC.setValue(prop ? prop.idAppUser : "");
        this.propertyTypeFC.setValue(prop ? prop.codePropertyType : "");
        this.mageOntologyCodeFC.setValue(prop ? prop.mageOntologyCode : "");
        this.mageOntologyDefFC.setValue(prop ? prop.mageOntologyDefinition : "");
        if(this.experimentPlatformMode){
            this.appliesToPlatform.setValue(this.expPlatform ? this.expPlatform: "");
        }

    }

    public onAnnotGridReady(params: any): void {
        this.annotGridApi = params.api;
        this.annotGridApi.sizeColumnsToFit();
    }

    public onAnnotGridRowDataChanged(): void {
        this.setProperty(null);
    }

    public onAnnotGridRowSelected(event: any): void {
        if (event.node.selected && event.data.idProperty) {
            this.propertyService.getPropertyAnnotation(event.data.idProperty).pipe(first()).subscribe((prop: any) => {
                this.setProperty(prop.Property);
                this.formGroup.markAsPristine();
            });
        }
    }

    public onOptionGridReady(params: any): void {
        this.optionGridApi = params.api;
        this.optionGridApi.sizeColumnsToFit();
    }

    public onOptionGridRowSelected(event: any): void {
        if (event.node.selected) {
            this.selectedOptionIndex = event.rowIndex;
        }
    }

    public onPlatformGridReady(params: any): void {
        this.platformGridApi = params.api;
        this.platformGridApi.sizeColumnsToFit();
    }

    public onPlatformGridRowSelected(event: any): void {
        if (event.node.selected) {
            this.selectedPlatformIndex = event.rowIndex;
        }
    }

    public onOrganismGridReady(params: any): void {
        this.organismGridApi = params.api;
        this.organismGridApi.sizeColumnsToFit();
    }

    public onOrganismGridRowSelected(event: any): void {
        if (event.node.selected) {
            this.selectedOrganismIndex = event.rowIndex;
        }
    }

    public onAnalysisTypeGridReady(params: any): void {
        this.analysisTypeGridApi = params.api;
        this.analysisTypeGridApi.sizeColumnsToFit();
    }

    public onAnalysisTypeGridRowSelected(event: any): void {
        if (event.node.selected) {
            this.selectedAnalysisTypeIndex = event.rowIndex;
        }
    }

    public onUserGridReady(params: any): void {
        this.userGridApi = params.api;
        this.userGridApi.sizeColumnsToFit();
    }

    public onUserGridRowSelected(event: any): void {
        if (event.node.selected) {
            this.selectedUserIndex = event.rowIndex;
        }
    }

    public sizeColumnsToFit(api: any): void {
        if (api) {
            api.sizeColumnsToFit();
        }
    }

    public save(): void {
        if (this.selectedProperty) {
            let propName: string = this.nameFC.value;
            propName = propName.trim().toLowerCase();
            if (!propName) {
                this.dialogsService.confirm("Please enter a name", null);
                return;
            }
            for (let reservedName of this.constantsService.RESERVED_SAMPLE_SHEET_COL_NAMES) {
                if (reservedName.toLowerCase() === propName) {
                    this.dialogsService.confirm("Please enter a different name, '" + propName + "' is reserved", null);
                    return;
                }
            }

            if (!this.forAnalysisFC.value && !this.forDataTrackFC.value && !this.forSampleFC.value && !this.forRequestFC.value) {
                this.dialogsService.confirm("Please choose the object(s) the annotation applies to", null);
                return;
            }

            if (this.forRequestFC.value && this.currentPlatforms.length < 1) {
                this.dialogsService.confirm("Annotations for experiment requests require at least 1 experiment platform", null);
                return;
            }
        }

        this.showSpinner = true;
        let params: URLSearchParams = new URLSearchParams();
        params.set("idProperty", this.selectedProperty.idProperty);
        params.set("name", this.nameFC.value);
        params.set("isActive", this.activeFC.value ? "Y" : "N");
        params.set("isRequired", this.requiredFC.value ? "Y" : "N");
        params.set("sortOrder", this.sortOrderFC.value);
        params.set("forSample", this.forSampleFC.value ? "Y" : "N");
        params.set("forDataTrack", this.forDataTrackFC.value ? "Y" : "N");
        params.set("forAnalysis", this.forAnalysisFC.value ? "Y" : "N");
        params.set("forRequest", this.forRequestFC.value ? "Y" : "N");
        params.set("mageOntologyCode", this.mageOntologyCodeFC.value);
        params.set("mageOntologyDefinition", this.mageOntologyDefFC.value);
        params.set("description", this.descriptionFC.value);
        params.set("idCoreFacility", this.coreFacilityFC.value);
        params.set("idAppUser", this.ownerFC.value);
        params.set("codePropertyType", this.propertyTypeFC.value);
        params.set("noJSONToXMLConversionNeeded", "Y");
        params.set("optionsJSONString", JSON.stringify(this.currentOptions));
        params.set("organismsJSONString", JSON.stringify(this.currentOrganisms));
        params.set("platformsJSONString", JSON.stringify(this.currentPlatforms));
        params.set("analysisTypesJSONString", JSON.stringify(this.currentAnalysisTypes));
        params.set("appUsersJSONString", JSON.stringify(this.currentUsers));

        this.propertyService.savePropertyAnnotation(params).subscribe((response: Response) => {
            let error: boolean = false;
            if (response) {
                let responseJSON: any = response.json();
                if (responseJSON && responseJSON.result && responseJSON.result === "SUCCESS") {
                    this.formGroup.markAsPristine();
                    this.snackBar.open("Annotation Saved", "Configure Annotations", {
                        duration: 2000,
                    });
                    if (responseJSON.inactivate === "true") {
                        this.dialogsService.confirm("Certan options were inactivated instead of deleted because they are associated with existing samples", null);
                    }
                    this.selectedProperty = null;
                    this.refreshPropertyList();
                } else {
                    error = true;
                }
            } else {
                error = true;
            }
            if (error) {
                this.dialogsService.confirm("An error occurred while saving the annotation", null);
            }
            this.showSpinner = false;
        });
    }

    public add(): void {
        let newProp: any = {};
        newProp.idProperty = "";
        newProp.idCoreFacility = !this.experimentPlatformMode ? this.myCoreFacilities[0].idCoreFacility: this.idCoreFacility;
        newProp.canUpdate = "Y";
        newProp.canDelete = "Y";
        newProp.name = "";
        newProp.isActive = "Y";
        newProp.isRequired = "N";
        newProp.sortOrder = "";
        newProp.forSample = this.orderType === this.SHOW_FOR_SAMPLES ? "Y" : "N";
        newProp.forDataTrack = this.orderType === this.SHOW_FOR_DATA_TRACKS ? "Y" : "N";
        newProp.forAnalysis = this.orderType === this.SHOW_FOR_ANALYSIS ? "Y" : "N";
        newProp.forRequest = this.orderType === this.SHOW_FOR_EXPERIMENTS ? "Y" : "N";
        newProp.mageOntologyCode = "";
        newProp.mageOntologyDefinition = "";
        newProp.description = "";
        newProp.options = [];
        newProp.platformApplications = [];
        newProp.organisms = [];
        newProp.analysisTypes = [];
        newProp.appUsers = [];
        newProp.idAppUser = this.createSecurityAdvisorService.hasPermission("canWriteDictionaries") ? "" : "" + this.createSecurityAdvisorService.idAppUser;
        newProp.codePropertyType = this.TYPE_TEXT;

        this.selectedTabIndex = 0;
        this.setProperty(newProp);
        this.formGroup.markAsDirty();
        this.annotGridApi.deselectAll();
    }

    public deleteAnnotation(): void {
        if (this.selectedProperty && this.selectedProperty.canDelete === "Y" && this.selectedProperty.idProperty) {
            this.dialogsService.confirm("Are you sure you want to remove annotation '" + this.selectedProperty.name + "'?", " ").subscribe((result: boolean) => {
                if (result) {
                    let params: URLSearchParams = new URLSearchParams();
                    params.set("idProperty", this.selectedProperty.idProperty);
                    params.set("deleteAll", "N");
                    this.propertyService.deletePropertyAnnotation(params).subscribe((response: Response) => {
                        let error: boolean = false;
                        if (response) {
                            let responseJSON: any = response.json();
                            if (responseJSON && responseJSON.result && responseJSON.result === "SUCCESS") {
                                this.snackBar.open("Annotation Deleted", "Configure Annotations", {
                                    duration: 2000,
                                });
                                this.selectedProperty = null;
                                this.refreshPropertyList();
                            } else if (responseJSON && responseJSON.result && responseJSON.result === "NONBLANKVALUES") {
                                let sampleCount: string = responseJSON.sampleCount;
                                let analysisCount: string = responseJSON.analysisCount;
                                let dataTrackCount: string = responseJSON.dataTrackCount;
                                let deleteAllowed: boolean = this.createSecurityAdvisorService.isSuperAdmin
                                    || (sampleCount === "0" && analysisCount === "0" && dataTrackCount === "0");
                                let associatedWarningMessage = "This annotation is associated with " + sampleCount + " sample(s), " +
                                    analysisCount + " analys(es), and " + dataTrackCount + " data track(s).";
                                if (deleteAllowed) {
                                    this.dialogsService.confirm(associatedWarningMessage + " Are you sure you want to delete?", " ").subscribe((answer: boolean) => {
                                        if (answer) {
                                            let params2: URLSearchParams = new URLSearchParams();
                                            params2.set("idProperty", responseJSON.idProperty);
                                            params2.set("deleteAll", "Y");
                                            this.propertyService.deletePropertyAnnotation(params2).subscribe((response2: Response) => {
                                                let error2: boolean = false;
                                                if (response2) {
                                                    let responseJSON2: any = response2.json();
                                                    if (responseJSON2 && responseJSON2.result && responseJSON2.result === "SUCCESS") {
                                                        this.snackBar.open("Annotation Deleted", "Configure Annotations", {
                                                            duration: 2000,
                                                        });
                                                        this.selectedProperty = null;
                                                        this.refreshPropertyList();
                                                    } else {
                                                        error2 = true;
                                                    }
                                                } else {
                                                    error2 = true;
                                                }
                                                if (error2) {
                                                    this.dialogsService.confirm("An error occurred while deleting the annotation", null);
                                                }
                                            });
                                        } else {
                                            this.selectedProperty = null;
                                            this.refreshPropertyList();
                                        }
                                    });
                                } else {
                                    this.dialogsService.confirm(associatedWarningMessage
                                        + "Please contact an administrator if you would like to delete the annotation and all its associated values", null);
                                }
                            } else {
                                error = true;
                            }
                        } else {
                            error = true;
                        }
                        if (error) {
                            this.dialogsService.confirm("An error occurred while deleting the annotation", null);
                        }
                    });
                }
            });
        }
    }

    public refresh(): void {
        this.orderType = "";
        this.idOrganism = "";
        this.requestCategory = "";
        this.idAnalysisType = "";
        this.selectedProperty = null;
        this.refreshPropertyList();
    }

    private refreshPropertyList(): void {
        this.propertyService.getPropertyList(true).subscribe((response: any[]) => {
            this.allProps = response;
            this.expPlatformService.emitPropertyList(this.allProps);
            if(!this.experimentPlatformMode){ // need to control timing of when to call this method for experiment platform mode
                this.updateDisplayedProperties();
            }

        });
    }

    public onCriteriaChange(): void {
        this.updateDisplayedProperties();
    }

    private compareCorefn(core1,core2){
        return core1 && core2 && core1 === core2;
    }

    externallyResizeGrid(){
        if(this.annotGridApi){
            this.annotGridApi.sizeColumnsToFit();
        }
    }

    public setupExpPlatformMode(expPlatform:any){
        this.formGroup.reset();
        let expPlatCoreFacilityFC = this.expPlatformService.findExpPlatformFormMember("ExperimentPlatformTabComponent.idCoreFacility");
        this.expPlatform = expPlatform;
        this.requestCategory = expPlatform.requestCategory;
        this.idCoreFacility = expPlatCoreFacilityFC.value;
        this.orderType = this.SHOW_FOR_EXPERIMENTS;

        // need to know that getPropertyList has loaded. Also need experiment platform's core facility, platform, and orderType is set before updateDisplayedProperties is ran
        this.expPlatformService.getPropertyListObservable().pipe(take(2)).subscribe( data =>{
            if(data){
                this.updateDisplayedProperties();
            }
        });

        this.coreFacilityFC.disable();


    }

}
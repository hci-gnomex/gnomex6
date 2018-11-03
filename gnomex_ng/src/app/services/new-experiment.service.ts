import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {ExperimentsService} from "../experiments/experiments.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {DictionaryService} from "./dictionary.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {GnomexService} from "./gnomex.service";
import {AnnotationService} from "./annotation.service";
import {BillingService} from "./billing.service";
import {PropertyService} from "./property.service";
import {CreateSecurityAdvisorService} from "./create-security-advisor.service";

@Injectable()
export class NewExperimentService {
    get filteredApps(): any[] {
        return this._filteredApps;
    }

    set filteredApps(value: any[]) {
        this._filteredApps = value;
    }
    get lanes(): any[] {
        return this._lanes;
    }

    set lanes(value: any[]) {
        this._lanes = value;
    }
    get project(): any {
        return this._project;
    }

    set project(value: any) {
        this._project = value;
    }
    get expTypeLabel(): string {
        return this._expTypeLabel;
    }

    set expTypeLabel(value: string) {
        this._expTypeLabel = value;
    }
    get numTubes(): number {
        return this._numTubes;
    }

    set numTubes(value: number) {
        this._numTubes = value;
    }
    get barCodes(): any[] {
        return this._barCodes;
    }

    set barCodes(value: any[]) {
        this._barCodes = value;
    }
    get preppedByClient(): boolean {
        return this._preppedByClient;
    }

    set preppedByClient(value: boolean) {
        this._preppedByClient = value;
        this.preppedChanged.next(true);
    }
    get selectedProto(): any {
        return this._selectedProto;
    }

    set selectedProto(value: any) {
        this._selectedProto = value;
        this.protoChanged.next(true);
    }
    get seqType(): any {
        return this._seqType;
    }

    set seqType(value: any) {
        this._seqType = value;
    }
    get billingAccount(): any {
        return this._billingAccount;
    }

    set billingAccount(value: any) {
        this._billingAccount = value;
        this.accountChanged.next(true);
    }
    get filteredGenomeBuildList(): any[] {
        return this._filteredGenomeBuildList;
    }

    set filteredGenomeBuildList(value: any[]) {
        this._filteredGenomeBuildList = value;
    }
    get organisms(): any[] {
        return this._organisms;
    }

    set organisms(value: any[]) {
        this._organisms = value;
    }
    get sampleOrganisms(): Set<any> {
        return this._sampleOrganisms;
    }

    set sampleOrganisms(value: Set<any>) {
        this._sampleOrganisms = value;
    }
    get componentRefs(): any[] {
        return this._componentRefs;
    }

    set componentRefs(value: any[]) {
        this._componentRefs = value;
    }
    get currentComponent(): any {
        return this._currentComponent;
    }

    set currentComponent(value: any) {
        this._currentComponent = value;
    }
    get components(): any[] {
        return this._components;
    }

    set components(value: any[]) {
        this._components = value;
    }
    get samplesGridRowData(): any[] {
        return this._samplesGridRowData;
    }

    set samplesGridRowData(value: any[]) {
        this._samplesGridRowData = value;
    }
    get sampleTypes(): any[] {
        return this._sampleTypes;
    }

    set sampleTypes(value: any[]) {
        this._sampleTypes = value;
    }
    get sampleType(): any {
        return this._sampleType;
    }

    set sampleType(value: any) {
        this._sampleType = value;
        if (this.sampleTypeChanged) {
            !this.sampleTypeChanged.next(true);
        }
    }
    get organism(): any {
        return this._organism;
    }

    set organism(value: any) {
        this._organism = value;
        this.organismChanged.next(true);
    }
    get experimentOwner(): any {
        return this._experimentOwner;
    }

    set experimentOwner(value: any) {
        this._experimentOwner = value;
        this.ownerChanged.next(true);

    }
    get idCoreFacility(): string {
        return this._idCoreFacility;
    }

    set idCoreFacility(value: string) {
        this._idCoreFacility = value;
    }
    get idAppUser(): string {
        return this._idAppUser;
    }

    set idAppUser(value: string) {
        this._idAppUser = value;
    }
    get numSamples(): any {
        return this._numSamples;
    }

    set numSamples(value: any) {
        this._numSamples = value;
        this.numSamplesChanged.next(true);
    }
    get propertyEntriesForUser(): any[] {
        return this._propertyEntriesForUser;
    }

    set propertyEntriesForUser(value: any[]) {
        this._propertyEntriesForUser = value;
    }
    get requestCategory(): any {
        return this._requestCategory;
    }

    set requestCategory(value: any) {
        this._requestCategory = value;
    }
    get propertyEntries(): any[] {
        return this._propertyEntries;
    }

    set propertyEntries(value: any[]) {
        this._propertyEntries = value;
    }
    get applicationName(): string {
        return this._applicationName;
    }

    set applicationName(value: string) {
        this._applicationName = value;
    }

    get codeApplication(): string {
        return this._codeApplication;
    }

    set codeApplication(value: string) {
        this._codeApplication = value;
        this.codeChanged.next(true);
    }
    get lab(): any {
        return this._lab;
    }

    set lab(value: any) {
        this._lab = value;
        this.labChanged.next(true);

    }
    get samplesGridApi() {
        return this._samplesGridApi;
    }
    set samplesGridApi(value: any) {
        this._samplesGridApi = value;
    }
    public currentState = new BehaviorSubject("SolexaBaseState");
    private _request: any;
    private _annotations: any[];
    private _samplesGridApi: any;
    private _samplesGridRowData: any[] = [];
    public sampleAnnotations: any[] = [];
    private _organism: any;
    private _category: any;
    private _lab: any;
    private _applicationName: string;
    private _codeApplication: string;
    private _propertyEntries: any[] = [];
    private _propertyEntriesForUser: any[] = [];
    private _requestCategory: any;
    private _sampleType: any;
    private _sampleTypes: any[] = [];
    private _numSamples: any;
    private _idAppUser: string;
    private _experimentOwner: any;
    private _idCoreFacility: string;
    private _components: any[] = [];
    private _componentRefs: any[] = [];
    private _currentComponent: any;
    private _billingAccount: any;
    private _seqType: any;
    private _selectedProto: any;
    private _preppedByClient: boolean;
    private _sampleOrganisms: Set<any> = new Set<any>();
    private _organisms: any[] = [];
    private _filteredGenomeBuildList: any[] = [];
    private _barCodes: any[] = [];
    private _numTubes: number;
    private _expTypeLabel: string;
    private _project: any;
    private _lanes: any[] = [];
    private _filteredApps: any[] = [];
    public samplesColumnApi: any;
    private hiSeqPrices: any[] = [];
    public selectedIndex: number = 0;
    public tabs: any[] = [];
    public samplesView;
    public hideSubmit: boolean = true;
    public disableSubmit: boolean = true;
    public propEntriesChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public hiSeqPricesChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public sampleTypeChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public numSamplesChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public samplesChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public ownerChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public labChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public accountChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public protoChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public preppedChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public codeChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public organismChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public Changed: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public onSamplesTab: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public onConfirmTab: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public samplesGridColumnDefs: any[] = [];
    public priceMap: Map<string, string> = new Map<string, string>();
    public filteredAppList: any[] = [];
    public genomeList: any[] = [];
    // public selectedIndex = new BehaviorSubject<number>(1);

    public readonly TYPE_MICROARRAY: string = 'MICROARRAY';
    public readonly TYPE_HISEQ: string = 'HISEQ';
    public readonly TYPE_MISEQ: string = 'MISEQ';
    public readonly TYPE_QC: string = 'QC';
    public readonly TYPE_CAP_SEQ: string = "CAPSEQ";
    public readonly TYPE_FRAG_ANAL: string = "FRAGANAL";
    public readonly TYPE_MIT_SEQ: string = "MITSEQ";
    public readonly TYPE_CHERRY_PICK: string = "CHERRYPICK";
    public readonly TYPE_ISCAN: string = "ISCAN";
    public readonly TYPE_ISOLATION: string = "ISOLATION";
    public readonly TYPE_CLINICAL_SEQUENOM: string = "CLINSEQ";
    public readonly TYPE_SEQUENOM: string = "SEQUENOM";
    public readonly TYPE_NANOSTRING: string = "NANOSTRING";
    public readonly TYPE_GENERIC: string = "GENERIC";

    public sampleSetupView: any;
    public setupView: any;
    constructor(private _http: Http,
                private dictionaryService: DictionaryService,
                private experimentService: ExperimentsService,
                private propertyService: PropertyService,
                private gnomexService: GnomexService,
                private billingService: BillingService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private annotationService: AnnotationService,
                private httpClient: HttpClient) {
        this.filteredAppList = this.dictionaryService.getEntries('hci.gnomex.model.Application').sort(this.sortApplication);
        this.genomeList = this.dictionaryService.getEntries('hci.gnomex.model.GenomeBuildLite');
        this.buildBarCodes();
    }


    isMicroarrayState(): boolean {
        if (this.requestCategory.type === this.TYPE_MICROARRAY) {
            return true;
        } else {
            return false;
        }
    }

    public isSolexaState():Boolean {
        if (this.currentState.value === 'SolexaBaseState' ||
            this.currentState.value === 'SolexaBaseExternalState' ||
            this.currentState.value === 'SolexaEditState' ||
            this.currentState.value === 'SeqExternalEditState' ||
            this.currentState.value === 'SolexaBaseAmendState' ||
            this.currentState.value === 'SolexaLaneAmendState') {
            return true;
        } else {
            return false;
        }
    }

    buildBarCodes () {
        let codes = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.OligoBarcode");
        for (let code of codes) {
            code.idOligoBarcodeB = code.idOligoBarcode;
            this.barCodes.push(code);
        }
    }

    public filterSampleType(codeNucleotideType: string, currentState: string, requestCategory: any): any[] {
        let doesMatchRequestCategory: boolean = false;
        let types: any[] = [];


        for (let category of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.SampleType")) {
            if (!this.isEditState(currentState) && category.isActive === 'N') {
                continue;
            }

            if (codeNucleotideType != null && category.codeNucleotideType != codeNucleotideType) {
                continue;
            }
            let theRequestCategories = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.SampleTypeRequestCategory").filter(category2 =>
                category2.value != "" && category2.idSampleType === category.value
            );
            for (let category3 of theRequestCategories) {
                if (category3.codeRequestCategory === requestCategory.codeRequestCategory) {
                    types.push(category);
                }
            }

        }

        return types;
    }

    get request(): any {
        return this._request;
    }

    set request(value: any) {
        this._request = value;
    }

    get category(): any {
        return this._category;
    }

    set category(value: any) {
        this._category = value;
    }

    get annotations(): any[] {
        return this._annotations;
    }

    set annotations(value: any[]) {
        this._annotations = value;
    }

    public isEditState(currentState: string): boolean {
        if (currentState == 'EditState' ||
            currentState == 'GenericEditState' ||
            currentState == 'SolexaEditState' ||
            currentState == 'SeqExternalEditState' ||
            currentState == 'QCEditState' ||
            currentState == 'MicroarrayEditState' ||
            currentState == 'CapSeqEditState' ||
            currentState == 'CherryPickEditState' ||
            currentState == 'FragAnalEditState' ||
            currentState == 'MitSeqEditState' ||
            currentState == 'IScanEditState' ||
            currentState == 'SequenomEditState' ||
            currentState == 'IsolationEditState' ||
            currentState == 'ClinicalSequenomEditState' ||
            currentState == 'NanoStringEditState') {
            return true;
        } else {
            return false;
        }
    }

    public isSequenomState(currentState): boolean {
        if (currentState == 'SequenomState' || currentState == 'SequenomEditState') {
            return true;
        } else {
            return false;
        }
    }

    public isClinicalSequenomState(currentState): boolean {
        if (currentState == 'ClinicalSequenomState' || currentState == 'ClinicalSequenomEditState') {
            return true;
        } else {
            return false;
        }
    }

    public isQCState(currentState): boolean {
        if (currentState == 'QCState' ||
            currentState == 'QCExternalState' ||
            currentState == 'QCEditState') {
            return true;
        } else {
            return false;
        }
    }

    public filterAnnotations(idOrganism): any[] {
        let fAnnotations: any[] = this.filterPropertiesByUser(this.annotations);;

        return fAnnotations;
        // let fAnnotations: any[] = [];
        // for (let annot of this.annotations) {
        //     annot = this.gnomexService.getSampleProperty(annot.idProperty);
        //     if (AnnotationService.isApplicableProperty(annot, this.category, idOrganism, this.requestCategory.codeRequestCategory)) {
        //         fAnnotations.push(annot);
        //     }
        // }
        // return fAnnotations;
    }

    public getMultiplexLanes(): void {
        if (this.isSolexaState() && this.gnomexService.isInternalExperimentSubmission) {
            this.initializeRequest();

            let stringifiedRequest = JSON.stringify(this.request);

            let params: HttpParams = new HttpParams()
                .set("requestXMLString", stringifiedRequest);

            // this.experimentService.getMultiplexLaneList(params).subscribe((respose) => {
            //
            // });

        }
    }


    public initializeRequest() {
        this.request.isExternal = this.isExternalExperimentSubmission() ? "Y" : "N";

        this.request.codeRequestCategory = this.requestCategory.codeRequestCategory.toString();
        this.request.idCoreFacility = this.requestCategory.idCoreFacility;

        this.request.idSubmitter = this.getIdAppUserOwner();
        if (this.gnomexService.hasPermission("canSubmitForOtherCores")) {
            this.request.idSubmitter = this.securityAdvisor.idAppUser;
        }
        this.request.idAppUser = this.getIdAppUserOwner();

        this.request.idLab = this.lab.idLab;
        if (this.request.isExternal === 'N') {
            if (this.billingAccount != null) {
                this.request.idBillingAccount = this.billingAccount.idBillingAccount;
            }
            // else if (setupView.selectedBillingTemplate != null) {
            //     request.billingTemplate = <billingTemplate></billingTemplate>;
            //     request.billingTemplate.appendChild(new XMLList(setupView.selectedBillingTemplate));
            // }
        }
        this.request.idProject = this.project.idProject;
        this.request.codeApplication = this.codeApplication;
        let requestCategory: any = this.dictionaryService.getEntry('hci.gnomex.model.RequestCategory', this.request.codeRequestCategory);
        this.request.samples = this.samplesGridRowData;

        this.request.idSlideProduct = '';

        // if (this.isSolexaState()) {
        //     for (var lane of lanes) {
        //         this.request.sequenceLanes.push(lane);
        //     }
        // }


    }

    public isExternalExperimentSubmission(): boolean {
        if (this.setupView.currentState == "ExternalExperimentState" ||
            this.setupView.currentState == "ExternalMicroarrayState" ||
            this.setupView.currentState == "AdminExternalExperimentState" ||
            this.setupView.currentState == "AdminExternalMicroarrayState") {
            return true;
        } else {
            return false;
        }

    }


    public sortSampleTypes(obj1, obj2): number {
        if (obj1 == null && obj2 == null) {
            return 0;
        } else if (obj1 == null) {
            return 1;
        } else if (obj2 == null) {
            return -1;
        } else {
            let order1: number = Number(obj1.sortOrder);
            let order2: number = Number(obj2.sortOrder);

            if (obj1.value == '') {
                return -1;
            } else if (obj2.value == '') {
                return 1;
            } else {
                if (order1 < order2) {
                    return -1;
                } else if (order1 > order2) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }
    }

    // Sort application by sortOrder field
    private sortApplication(obj1, obj2): number {
        if (obj1 === null && obj2 === null) {
            return 0;
        } else if (obj1 === null) {
            return 1;
        } else if (obj2 === null) {
            return -1;
        } else {
            var order1: number = obj1.sortOrder;
            var order2: number = obj2.sortOrder;
            var disp1: string = obj1.display;
            var disp2: string = obj2.display;

            if (obj1.value === '') {
                return -1;
            } else if (obj2.value === '') {
                return 1;
            } else {
                if (order1 < order2) {
                    return -1;
                } else if (order1 > order2) {
                    return 1;
                } else {
                    if (disp1 < disp2) {
                        return -1;
                    } else if (disp1 > disp2) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }

    updateRequestProperties():void {

        let application: any = this.dictionaryService.getEntry('hci.gnomex.model.Application', this.request.codeApplication);

        this.request.samples = this.samplesGridRowData;
        this.request.hybridizations = {};
        this.request.sequenceLanes = this.lanes;

        // Visibility
        // todo
        // this.request.codeVisibility = visibilityView.visibilityRadioGroup.selectedValue;
        // if (this.request.@codeVisibility != null && this.request.@codeVisibility == 'INST') {
        //     // Only set the institution if the visibility view in initialized, meaning
        //     // that the user has selected the visibility tab.  Otherwise, just leave
        //     // the institution to is previously set value.
        //     if (visibilityView.institutionCombo != null && visibilityView.institutionCombo.selectedItem != null) {
        //         request.@idInstitution = visibilityView.institutionCombo.selectedItem.@idInstitution;
        //     }
        //     else if (parentApplication.getProperty(parentApplication.PROPERTY_ID_DEFAULT_INSTITUTION) != null) {
        //         request.@idInstitution = parentApplication.getProperty(parentApplication.PROPERTY_ID_DEFAULT_INSTITUTION);
        //     }
        //     else {
        //         request.@idInstitution = "";
        //     }
        // }

        // Collaborators
        // todo
        // if (visibilityView != null && visibilityView.enabled) {
        //     request.replace("collaborators", <collaborators></collaborators>);
        //         for each(var collaborator:Object in visibilityView.getCollaborators()) {
        //         request.collaborators.appendChild(collaborator);
        //     }
        // }
        // request.@privacyExpirationDate = visibilityView.privacyExpirationPicker.text;

        this.request.idAppUser = this.idAppUser;
        this.request.idSubmitter = this.experimentOwner.idAppUser;
        this.request.idLab = this.lab.idLab;
        this.request.idProject = this.project.idProject;

        //TODO
        //Add new annotations to Sample that have not had data added to them in samples grid.
        // if (request.samples.Sample.length() > 0) {
        //     for each(var prop:XML in this.propertyEntries) {
        //         if (prop.@isSelected == "true" && !(request.samples.Sample[0].hasOwnProperty("@ANNOT" + prop.@idProperty))) {
        //             request.samples.Sample[0]["@ANNOT" + prop.@idProperty] = "";
        //         }
        //     }
        // }
    }

    public checkSamplesCompleteness() {
        let numberOfAdditionalLanes: number = 0;
        for (let s2 of this.samplesGridRowData) {
            if (this.isEntered(s2, "numberSequencingLanes")) {
                numberOfAdditionalLanes += s2.numberSequencingLanes;
            }
        }
        let completeCount: number = 0;
        let nameCompleteCount: number = 0;

        for (let sample of this.samplesGridRowData) {

            if (this.isEntered(sample, "name") &&
            this.isEntered(sample, "idSampleType") &&
            this.isEntered(sample, "idOrganism") &&
            this.isEntered(sample, "idSeqRunType") &&
            this.isEntered(sample, "idNumberSequencingCycles") &&
            this.isEntered(sample, "idNumberSequencingCyclesAllowed") &&
            this.isEntered(sample, "multiplexGroupNumber") &&
            (this.isEntered(sample, "numberSequencingLanes") && numberOfAdditionalLanes > 0)) {
                completeCount++;
            }

        }
        let isValidNumberSeqLanes: boolean = true;
        if (isValidNumberSeqLanes) {
            var lanesAdded:Boolean = false;
            for (let theSample of this.samplesGridRowData) {
                let numberLanesForSample: number = this.getLaneCount(theSample);
                let numLanes: number = 1;
                numLanes = theSample.numberSequencingLanes;
                if (numberLanesForSample < numLanes) {
                    let numberLanesToAdd: number = numLanes - numberLanesForSample;
                    for (let x: number = 0; x < numberLanesToAdd; x++) {
                        this.addSequencingLaneForSample(theSample);
                        lanesAdded = true;
                    }
                } else if (numberLanesForSample > numLanes) {
                    let numberLanesToRemove: number = numberLanesForSample - numLanes;
                    for (let lane of this.getLanes(theSample, numberLanesToRemove)) {
                        // TODO
                        // parentDocument.lanes.removeItemAt(parentDocument.lanes.getItemIndex(lane));
                    }
                }

            }
        }

    }

    getLanes(sample: any, numberOfLanes: number): any[] {
        let theLanes: any[] = [];
        if (theLanes != null) {
            for (let sequenceLane of this.lanes) {
                if (sequenceLane.idSample === sample.idSample) {
                    theLanes.push(sequenceLane);
                    if (numberOfLanes != -1 && theLanes.length == numberOfLanes) {
                        break;
                    }
                }
            }
        }
        return theLanes;
    }


    addSequencingLaneForSample(sample: any):void {
        let lanePlus: number = parseInt(sample.multiplexGroupNumber) + 100000;
        let laneStr: string = lanePlus.toString().substr(1);

        let laneObj = {
            idSequenceLane: 'SequenceLane' + laneStr,
            notes: '',
            idSeqRunType: sample.idSeqRunType,
            idNumberSequencingCycles: sample.idNumberSequencingCycles,
            idNumberSequencingCyclesAllowed: sample.idNumberSequencingCyclesAllowed,
            idSample: sample.idSample,
            idGenomeBuildAlignTo: ''

        };
        this.lanes.push(laneObj);
    }

    getLaneCount(sample: any): number {
        let count: number = 0;
        if (this.lanes != null) {
            for (let sequenceLane of this.lanes) {
                if (sequenceLane.idSample === sample.idSample) {
                    count++;
                }
            }
        }
        return count;
    }


    isEntered(sample: any, fieldName: string): boolean {
        if (!sample.hasOwnProperty(fieldName) || sample[fieldName] == '') {
            return false;
        } else {
            return true;
        }
    }

    public filterApplication(requestCategory, seqPrepByCore): any[] {
        let filteredApps: any[] = [];
        for (let app of this.filteredAppList) {
            if (!app.value) {
                continue;
            }
            if (app.isActive === 'N') {
                continue;
            }
            var doesMatchRequestCategory: boolean = false;
            let theApplications = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.RequestCategoryApplication").filter(reqCatApp =>

                reqCatApp.value != "" && reqCatApp.codeApplication === app.value
            );
            for (var xref of theApplications) {
                if (xref.codeRequestCategory === requestCategory.codeRequestCategory) {
                    doesMatchRequestCategory = true;
                    break;
                }
            }

            var doesMatchSeqPrepByCore: boolean = false;
            if (doesMatchRequestCategory) {
                if (requestCategory.isIlluminaType !== 'Y' || !this.gnomexService.isInternalExperimentSubmission) {
                    doesMatchSeqPrepByCore = true;
                } else {
                    doesMatchSeqPrepByCore = (app.onlyForLabPrepped === "N" || !seqPrepByCore);
                }
            }
            if (doesMatchRequestCategory && doesMatchSeqPrepByCore) {
                filteredApps.push(app);
            }
        }
        return filteredApps;
    }

    public sortNumberSequencingCyclesAllowed(obj1: any, obj2: any): number {
        if (obj1 == null && obj2 == null) {
            return 0;
        } else if (obj1 == null) {
            return 1;
        } else if (obj2 == null) {
            return -1;
        } else {

            if (obj1.value === '') {
                return -1;
            } else if (obj2.value === '') {
                return 1;
            } else {
                var isCustom1:String = obj1.isCustom;
                var isCustom2:String = obj2.isCustom
                var numberCycles1:Number = obj1.numberSequencingCyclesDisplay;
                var numberCycles2:Number = obj2.numberSequencingCyclesDisplay;
                var sortOrder1:Number = obj1.sortOrder === '' ? -1 : obj1.sortOrder;
                var sortOrder2:Number = obj2.sortOrder === '' ? -1 : obj2.sortOrder;

                if (isCustom1 < isCustom2) {
                    return -1;
                } else if (isCustom1 > isCustom2) {
                    return 1;
                } else {
                    if (sortOrder1 < sortOrder2) {
                        return -1;
                    } else if (sortOrder1 > sortOrder2) {
                        return 1;
                    } else {
                        if (numberCycles1 < numberCycles2) {
                            return -1;
                        } else if (numberCycles1 > numberCycles2) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                }
            }
        }
    }

    public filterNumberSequencingCyclesAllowed(cycles: any[], requestCategory: any): any[] {
        let seqCycles: any[] = [];

        for (let cycle of cycles) {
            if (cycle.value) {

                var doesMatch: Boolean = false;
                if (cycle.codeRequestCategory === requestCategory.codeRequestCategory && cycle.isActive.toString() === 'Y') {
                    seqCycles.push(cycle);
                }
            }
        }
        return seqCycles;
    }

    public getOrganism(): any {
        if (this.sampleSetupView && (this.isMicroarrayState() || this.isSolexaState()) && this.currentState.value != 'SolexaLaneAmendState') {
            return this.sampleSetupView.form.get("organism").value;
        } else if (this.request != null) {
            let idOrganism = null;
            if (this.request.idOrganismSampleDefault && this.request.idOrganismSampleDefault != '') {
                idOrganism = this.request.idOrganismSampleDefault;
            } else {
                if (this.request.samples.length > 0) {
                    for (let sample of this.request.samples.Sample) {
                        if (sample.idOrganism) {
                            idOrganism = sample.idOrganism;
                            break;
                        }
                    }
                }
            }
            let organismList = this.dictionaryService.getEntry('hci.gnomex.model.OrganismLite', idOrganism);
            if (organismList && organismList.length() > 0) {
                return organismList[0];
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    public filterPropertyEntryWithFullProperty(property, sce): boolean {
        let keep: boolean = false;
        let idOrganism: string = null;
        if (this.getOrganism() != null) {
            idOrganism = this.getOrganism().idOrganism;
        }
        if (AnnotationService.isApplicableProperty(property, this.requestCategory, idOrganism, this.codeApplication)) {
            if (sce.isSelected === 'true' || property.isActive !== 'N') {
                keep = true;
            }
        }

        return keep;
    }

    public getIdAppUserOwner(): any {
        return this.setupView.idAppUser;
    }

    getHiSeqPriceList() {
        let appPriceListParams: HttpParams = new HttpParams().set("codeRequestCategory" ,this.requestCategory.codeRequestCategory)
            .set("idLab", this.lab.idLab);
        this.billingService.getHiSeqRunTypePriceList(appPriceListParams).subscribe((response: any) => {
            this.hiSeqPrices = response;
            if (Array.isArray(response)) {
            for (let price of response) {
                let key: string = price.idNumberSequencingCyclesAllowed;
                this.priceMap.set(key, price.price);
            }
            }
            this.hiSeqPricesChanged.next(true);

        });

    }

    public filterPropertiesWithFullProperty(property, sce): boolean {
        let keep: boolean = false;
        let idOrganism: string = null;
        if (this.getOrganism() != null) {
            idOrganism = this.getOrganism().idOrganism;
        }
        if (AnnotationService.isApplicableProperty(property, this.requestCategory, idOrganism, this.codeApplication)) {
            if (sce.isSelected == 'true' || property.isActive != 'N') {
                keep = true;
            }
        }

        return keep;
    }

    public buildPropertiesByUser() {
        this.propertyService.getPropertyList(false).subscribe((response: any[]) => {
            this.propertyEntries = response;
            this.propertyEntriesForUser = this.filterPropertiesByUser(this.propertyEntries);
            this.propertyEntriesForUser.sort(AnnotationService.sortProperties);
        });

    }

    public filterPropertiesByUser(propsToFilter: any[]): any[] {
        // Get property with children (organisms, platforms, appusers).
        let properties: any[] = [];

        for (let property of propsToFilter) {
            if (property.name.startsWith("mSelect")) {
                console.log("jj");
            }
            let entry = Object(this.gnomexService.getSampleProperty(property.idProperty));
            let keep: boolean = this.filterPropertyEntryWithFullProperty(entry, property);
            if (keep) {
                keep = false;
                let users: any;
                if (entry.appUsers) {
                     users = entry.appUsers.AppUserLite;
                }
                if (!users) {
                    keep = true;
                } else {
                    let allowedUsers: any[] = this.getAnnotationAllowedUserList();
                    if (!Array.isArray(users)) {
                        users = [users];
                    }
                    for (let user of users) {
                        for (let u1 of allowedUsers) {
                            if (u1 === user.idAppUser) {
                                keep = true;
                                break;
                            }
                        }
                        if (keep) {
                            break;
                        }
                    }
                }
            }
            if (keep) {
                properties.push(property);
            }
        }
        this.propEntriesChanged.next(true);
        return properties;
    }

    public filterBySampleOrganism(genomeBuildOrganism: any): any[] {
        let genomeBuilds: any[] = [];
        for (let genomeBuild of this.genomeList) {
            if (genomeBuild.idOrganism === genomeBuildOrganism) {
                genomeBuilds.push(genomeBuild);
            }
        }
        return genomeBuilds;
    }

    private getAnnotationAllowedUserList(): any[] {

        let userList: any[] = [];
        // Owner of the experiment
        this.pushUnique(userList, this.experimentOwner);

        // Submitter -- if different and not null
        //TODO
        this.pushUnique(userList, this.idAppUser);

        // current user -- if different
        //TODO
        // pushUnique(userList, parentApplication.getIdAppUser());

        return userList;
    }


    private pushUnique(a: any[], v: string):void {
        if (v !== null && v !== '') {
            for (let v1 of a) {
                if (v1 === v) {
                    return;
                }
            }
            a.push(v);
        }
    }

    public getFilteredGenomeBuildList(idOrganism: string): any[] {
        let genomeList: any[] = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.GenomeBuildLite");
        genomeList = this.filterBySampleOrganism(idOrganism);
        return genomeList;
    }

    public getSubmitterName(): string {
        if (this.experimentOwner) {
            return this.experimentOwner.displayName;
        } else {
            return this.securityAdvisor.userName;
        }
    }

    submit() { }

}

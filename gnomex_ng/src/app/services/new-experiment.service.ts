import {Injectable} from "@angular/core";
import {ExperimentsService} from "../experiments/experiments.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {DictionaryService} from "./dictionary.service";
import {BehaviorSubject, Observable} from "rxjs";
import {GnomexService} from "./gnomex.service";
import {AnnotationService} from "./annotation.service";
import {BillingService} from "./billing.service";
import {PropertyService} from "./property.service";
import {CreateSecurityAdvisorService} from "./create-security-advisor.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {first} from "rxjs/internal/operators";
import {CookieUtilService} from "./cookie-util.service";

@Injectable()
export class NewExperimentService {

    // get filteredApps(): any[] {
    //     return this._filteredApps;
    // }
    // set filteredApps(value: any[]) {
    //     this._filteredApps = value;
    // }

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
        this._barCodes = [];

        for (let code of value) {
            code.idOligoBarcodeB = code.idOligoBarcode;
            this._barCodes.push(code);
        }
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

    // get filteredGenomeBuildList(): any[] {
    //     return this._filteredGenomeBuildList;
    // }
    // set filteredGenomeBuildList(value: any[]) {
    //     this._filteredGenomeBuildList = value;
    // }

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
            this.sampleTypeChanged.next(true);
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


    get currentState(): string {
        if (this._currentState_subject) {
            return this._currentState_subject.value
        } else {
            return '';
        }
    }
    set currentState(value: string) {
        this._currentState_subject.next(value);
    }
    get currentState_onChangeObservable(): Observable<string> {
        return this._currentState_subject.asObservable();
    }

    public _currentState_subject = new BehaviorSubject("SolexaBaseState");

    private _request: any;
    private _annotations: any[];
    private _samplesGridApi: any;
    private _samplesGridRowData: any[] = [];
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
    private _billingAccount: any;
    private _seqType: any;
    private _selectedProto: any;
    private _preppedByClient: boolean;
    private _sampleOrganisms: Set<any> = new Set<any>();
    private _organisms: any[] = [];
    // private _filteredGenomeBuildList: any[] = [];
    private _barCodes: any[] = [];
    private _numTubes: number;
    private _expTypeLabel: string;
    private _project: any;
    private _lanes: any[] = [];
    // private _filteredApps: any[] = [];
    // public samplesColumnApi: any;
    // private hiSeqPrices: any[] = [];
    // public samplesView;
    // public hideSubmit: boolean = true;
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
    // public Changed: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    // public onSamplesTab: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public onConfirmTab: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public samplesGridColumnDefs: any[] = [];
    public priceMap: Map<string, string> = new Map<string, string>();
    public filteredAppList: any[] = [];
    public genomeList: any[] = [];

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

    constructor(private billingService: BillingService,
                private cookieUtilService: CookieUtilService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private dialogService: DialogsService,
                private dictionaryService: DictionaryService,
                private experimentService: ExperimentsService,
                private gnomexService: GnomexService,
                private httpClient: HttpClient,
                private propertyService: PropertyService) {

        this.refreshDictionaries();
    }

    private refreshDictionaries () {
        this.filteredAppList = this.dictionaryService.getEntries('hci.gnomex.model.Application').sort(NewExperimentService.sortApplication);
        this.genomeList = this.dictionaryService.getEntries('hci.gnomex.model.GenomeBuildLite');
        this.barCodes = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.OligoBarcode");
    }


    public isExternalExperimentSubmission(): boolean {
        return this.setupView.currentState === "ExternalExperimentState"
            || this.setupView.currentState === "ExternalMicroarrayState"
            || this.setupView.currentState === "AdminExternalExperimentState"
            || this.setupView.currentState === "AdminExternalMicroarrayState";
    }


    public isEditState(): boolean {
        return this.currentState === 'EditState'
            || this.currentState === 'GenericEditState'
            || this.currentState === 'SolexaEditState'
            || this.currentState === 'SeqExternalEditState'
            || this.currentState === 'QCEditState'
            || this.currentState === 'MicroarrayEditState'
            || this.currentState === 'CapSeqEditState'
            || this.currentState === 'CherryPickEditState'
            || this.currentState === 'FragAnalEditState'
            || this.currentState === 'MitSeqEditState'
            || this.currentState === 'IScanEditState'
            || this.currentState === 'SequenomEditState'
            || this.currentState === 'IsolationEditState'
            || this.currentState === 'ClinicalSequenomEditState'
            || this.currentState === 'NanoStringEditState';
    }

    public isMicroarrayState(): boolean {
        return this.requestCategory
            && this.requestCategory.type === this.TYPE_MICROARRAY;
    }

    public isQCState(): boolean {
        return this.currentState === 'QCState'
            || this.currentState === 'QCExternalState'
            || this.currentState === 'QCEditState';
    }

    public isSolexaState():Boolean {
        return this.currentState === 'SolexaBaseState'
            || this.currentState === 'SolexaBaseExternalState'
            || this.currentState === 'SolexaEditState'
            || this.currentState === 'SeqExternalEditState'
            || this.currentState === 'SolexaBaseAmendState'
            || this.currentState === 'SolexaLaneAmendState';
    }

    public isSequenomState(): boolean {
        return this.currentState === 'SequenomState'
            || this.currentState === 'SequenomEditState';
    }

    public isClinicalSequenomState(): boolean {
        return this.currentState === 'ClinicalSequenomState'
            || this.currentState === 'ClinicalSequenomEditState';
    }


    public filterAnnotations(idOrganism): any[] {
        let fAnnotations: any[] = this.filterPropertiesByUser(this.annotations);

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

        // let requestCategory: any = this.dictionaryService.getEntry('hci.gnomex.model.RequestCategory', this.request.codeRequestCategory);

        this.request.samples = this.samplesGridRowData;

        this.request.idSlideProduct = '';

        // if (this.isSolexaState()) {
        //     for (var lane of lanes) {
        //         this.request.sequenceLanes.push(lane);
        //     }
        // }


    }


    private createNewExperimentObject(): any {

        let experiment: any = {
            name:                               "",
            number:                             "",
            description:                        "",
            codeProtocolType:                   "",
            corePrepInstructions:               "",
            analysisInstructions:               "",
            captureLibDesignId:                 "",
            avgInsertSizeFrom:                  "",
            avgInsertSizeTo:                    "",
            idSlideProduct:                     "",
            protocolNumber:                     "",
            numberOfSamples:                    '', // "0",
            idSampleTypeDefault:                '', // "1"
            bioinformaticsAssist:               "",
            idOrganismSampleDefault:            '', // "204"
            isArrayINFORequest:                 "",
            canDeleteSample:                    "Y",
            canUpdateSamples:                   "Y",
            isVisibleToMembers:                 '', // "Y",
            isVisibleToPublic:                  '', // "N"
            truncatedLabName:                   "",
            billingAccountName:                 "",
            billingAccountNumber:               "",
            lastModifyDate:                     "",
            codeRequestStatus:                  "",
            idSampleDropOffLocation:            "",
            submitterEmail:                     "",
            submitterPhone:                     "",
            submitterInstitution:               "",
            isDNASeqExperiment:                 '', // "N"
            applicationNotes:                   "",
            coreToExtractDNA:                   '', // "N"
            processingDate:                     "",
            codeIsolationPrepType:              "",
            hasPrePooledLibraries:              "",
            numPrePooledTubes:                  "",
            includeBisulfideConversion:         '', // "N",
            includeQubitConcentration:          '', // "N"
            turnAroundTime:                     "",
            idCoreFacility:                     '', // "1"
            idProductOrder:                     "",
            idLab:                              '', // "1125",
            idRequest:                          "0", // idRequest === 0 indicates to the backend that this is a new Request.
            idAppUser:                          '', // "4777", // I believe this is the idAppUser of the submitter, which may not be the same as the user
            createDate:                         "",
            completedDate:                      "",
            notes:                              "",
            application:                        "",
            projectName:                        "",
            idProject:                          '', // "62962"
            project:                            "",
            slideProduct:                       "",
            isExternal:                         '', // "N",
            requestStatus:                      "",
            reagent:                            '', // "asdf"
            elutionBuffer:                      '', // "fdsa",
            usedDnase:                          "",
            usedRnase:                          "",
            keepSamples:                        '', // "Y"
            seqPrepByCore:                      "",
            adminNotes:                         "",
            archived:                           "",
            codeRequestCategory:                '', // "NOSEQ",
            privacyExpirationDate:              "",
            targetClassIdentifier:              "0",
            targetClassName:                    "hci.gnomex.model.Request",
            idBillingAccount:                   '', // "9246",
            codeApplication:                    '', // "APP198",
            codeBioanalyzerChipType:            "",
            codeVisibility:                     '', // "MEM",
            canUpdateVisibility:                '', // "N",
            isVisibleToMembersAndCollaborators: '', // "N",
            idProduct:                          "",
            canRead:                            '', // "Y",
            canUploadData:                      '', // "N",
            canDelete:                          '', // "Y",
            ownerName:                          "",
            idInstitution:                      "",
            idSubmitter:                        '', // "4777",
            canUpdate:                          '', // "Y",
            submitterName:                      "",
            labName:                            "",
            projectDescription:                 "",
            accountNumberDisplay:               "",
            idOrganism:                         "",
            organismName:                       "",
            otherOrganism:                      "",
            hasCCNumber:                        '', // "N",
            hasSampleDescription:               '', // "N",
            hasPlates:                          '', // "N",
            isOpeningNewBillingTemplate:        '', // "N"
            hybridizations:          [],
            labeledSamples:          [],
            analysisExperimentItems: [],
            seqLibTreatments:        [],
            files:                   [],
            collaborators:           [],
            workItems:               [],
            billingItems:            [],
            SeqLibTreatmentEntries:  [],
            protocols:               [],
            samples:                 [],
            sequenceLanes:           [],
            PropertyEntries:         [],
            RequestProperties:       [],
        };

        return experiment;
    }

    public spoofNewExperimentObject(): any {

        let experiment: any = {
            name:                               "",
            number:                             "",
            description:                        "",
            codeProtocolType:                   "",
            corePrepInstructions:               "",
            analysisInstructions:               "",
            captureLibDesignId:                 "",
            avgInsertSizeFrom:                  "",
            avgInsertSizeTo:                    "",
            idSlideProduct:                     "",
            protocolNumber:                     "",
            numberOfSamples:                    "0",
            idSampleTypeDefault:                "1",
            bioinformaticsAssist:               "",
            idOrganismSampleDefault:            "204",
            isArrayINFORequest:                 "",
            canDeleteSample:                    "Y",
            canUpdateSamples:                   "Y",
            isVisibleToMembers:                 "Y",
            isVisibleToPublic:                  "N",
            truncatedLabName:                   "",
            billingAccountName:                 "",
            billingAccountNumber:               "",
            lastModifyDate:                     "",
            codeRequestStatus:                  "",
            idSampleDropOffLocation:            "",
            submitterEmail:                     "",
            submitterPhone:                     "",
            submitterInstitution:               "",
            isDNASeqExperiment:                 "N",
            applicationNotes:                   "",
            coreToExtractDNA:                   "N",
            processingDate:                     "",
            codeIsolationPrepType:              "",
            hasPrePooledLibraries:              "",
            numPrePooledTubes:                  "",
            includeBisulfideConversion:         "N",
            includeQubitConcentration:          "N",
            turnAroundTime:                     "",
            idCoreFacility:                     "1",
            idProductOrder:                     "",
            idLab:                              "1125",
            idRequest:                          "0", // idRequest === 0 indicates to the backend that this is a new Request.
            idAppUser:                          "4777", // I believe this is the idAppUser of the submitter, which may not be the same as the user
            createDate:                         "",
            completedDate:                      "",
            notes:                              "",
            application:                        "",
            projectName:                        "",
            idProject:                          "62962",
            project:                            "",
            slideProduct:                       "",
            isExternal:                         "N",
            requestStatus:                      "",
            reagent:                            "asdf",
            elutionBuffer:                      "fdsa",
            usedDnase:                          "",
            usedRnase:                          "",
            keepSamples:                        "Y",
            seqPrepByCore:                      "",
            adminNotes:                         "",
            archived:                           "",
            codeRequestCategory:                "NOSEQ",
            privacyExpirationDate:              "",
            targetClassIdentifier:              "0",
            targetClassName:                    "hci.gnomex.model.Request",
            idBillingAccount:                   "9246",
            codeApplication:                    "APP198",
            codeBioanalyzerChipType:            "",
            codeVisibility:                     "MEM",
            canUpdateVisibility:                "N",
            isVisibleToMembersAndCollaborators: "N",
            idProduct:                          "",
            canRead:                            "Y",
            canUploadData:                      "N",
            canDelete:                          "Y",
            ownerName:                          "",
            idInstitution:                      "",
            idSubmitter:                        "4777",
            canUpdate:                          "Y",
            submitterName:                      "",
            labName:                            "",
            projectDescription:                 "",
            accountNumberDisplay:               "",
            idOrganism:                         "",
            organismName:                       "",
            otherOrganism:                      "",
            hasCCNumber:                        "N",
            hasSampleDescription:               "N",
            hasPlates:                          "N",
            isOpeningNewBillingTemplate:        "N",
            hybridizations:          [],
            labeledSamples:          [],
            analysisExperimentItems: [],
            seqLibTreatments:        [],
            files:                   [],
            collaborators:           [],
            workItems:               [],
            billingItems:            [],
            SeqLibTreatmentEntries:  [],
            protocols:               [],
            samples:                 [
                {
                    idSample: "Sample0",
                    name: "asdffdsa",
                    description: "",
                    canChangeSampleName: "Y",
                    canChangeSampleType: "Y",
                    canChangeSampleConcentration: "Y",
                    canChangeSampleSource: "Y",
                    canChangeNumberSequencingCycles: "Y",
                    canChangeNumberSequencingLanes: "Y",
                    concentration: "",
                    label: "",
                    idOligoBarcode: "",
                    barcodeSequence: "",
                    idOligoBarcodeB: "",
                    barcodeSequenceB: "",
                    idNumberSequencingCycles: "5",
                    idNumberSequencingCyclesAllowed: "69",
                    idSeqRunType: "4",
                    numberSequencingLanes: "1",
                    codeConcentrationUnit: "ng/ul",
                    idSampleType: "1",
                    idSeqLibProtocol: "361",
                    seqPrepByCore: "Y",
                    idOrganism: "204",
                    otherOrganism: "",
                    treatment: "",
                    customColor: "0xFFFFFF",
                    multiplexGroupNumber: "10",
                    isDirty: "Y"
                },
                {
                    idSample: "Sample1",
                    name: "fdsaasdf",
                    description: "",
                    canChangeSampleName: "Y",
                    canChangeSampleType: "Y",
                    canChangeSampleConcentration: "Y",
                    canChangeSampleSource: "Y",
                    canChangeNumberSequencingCycles: "Y",
                    canChangeNumberSequencingLanes: "Y",
                    concentration: "",
                    label: "",
                    idOligoBarcode: "",
                    barcodeSequence: "",
                    idOligoBarcodeB: "",
                    barcodeSequenceB: "",
                    idNumberSequencingCycles: "5",
                    idNumberSequencingCyclesAllowed: "69",
                    idSeqRunType: "4",
                    numberSequencingLanes: "1",
                    codeConcentrationUnit: "ng/ul",
                    idSampleType: "1",
                    idSeqLibProtocol: "361",
                    seqPrepByCore: "Y",
                    idOrganism: "204",
                    otherOrganism: "",
                    treatment: "",
                    customColor: "0xFFFFFF",
                    multiplexGroupNumber: "10",
                    isDirty: "Y"
                }
            ],
            sequenceLanes:           [
                {
                    idSequenceLane: "SequenceLane00010",
                    notes: "",
                    idSeqRunType: "4",
                    idNumberSequencingCycles: "5",
                    idNumberSequencingCyclesAllowed: "69",
                    idSample: "Sample0",
                    idGenomeBuildAlignTo: "",
                    idOrganism: "204",
                    organism: "Acacia penninervis"
                },
                {
                    idSequenceLane: "SequenceLane00010",
                    notes: "",
                    idSeqRunType: "4",
                    idNumberSequencingCycles: "5",
                    idNumberSequencingCyclesAllowed: "69",
                    idSample: "Sample1",
                    idGenomeBuildAlignTo: "",
                    idOrganism: "204",
                    organism: "Acacia penninervis"
                }
            ],
            PropertyEntries:         [
                {
                    idProperty: "75",
                    name: "RIN",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "0",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "81",
                    name: "Sample Location",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "0",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "77",
                    name: "Input",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "1",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "72",
                    name: "Volume (uL)",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "2",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "71",
                    name: "Yield (ng)",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "3",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "24",
                    name: "Kit Lot#",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "4",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "94",
                    name: "CodeSet Lot#",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "5",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "73",
                    name: "Kit Exp. Date",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "5",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "95",
                    name: "Hybridization Time",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "6",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "74",
                    name: "Specimen Comments",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "6",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "96",
                    name: "Catridge ID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "7",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "102",
                    name: "Cartridge Lot#",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "9",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "103",
                    name: "Plate Lot#",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "10",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "38",
                    name: "# of AB slides",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: "# of AB slides"
                },
                {
                    idProperty: "252",
                    name: "# of Cells",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "308",
                    name: "+/- serum",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "461",
                    name: "12344321",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "350",
                    name: "2DAP",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "420",
                    name: "3 day mechanical vent",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "388",
                    name: "3 mouse genotypes 4  Abs",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "185",
                    name: "33988",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "353",
                    name: "3DAP",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "354",
                    name: "4DAP",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "355",
                    name: "6DAP",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "154",
                    name: "8 experimental conditions 3 antibodies",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "416",
                    name: "AD",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "379",
                    name: "ADPRC",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "163",
                    name: "aerial shoot grafted to root",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "393",
                    name: "Affected/Unaffected",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "276",
                    name: "Age",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "1",
                    name: "Age / Developmental Stage",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "87",
                    name: "Alt ID ",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "332",
                    name: "Amplicon",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "330",
                    name: "Amplicon Set",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "166",
                    name: "AmpureID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "65",
                    name: "Antibody",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "412",
                    name: "AS",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "302",
                    name: "Assembly",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "251",
                    name: "ATAC-seq Rat HFD",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "391",
                    name: "ATAC-seq sheep betamethasone pilot",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "189",
                    name: "Bacteriophage",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "440",
                    name: "Balb/c",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "275",
                    name: "Banked iPSC",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "273",
                    name: "Banked Platelets",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "274",
                    name: "Banked Tissues",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "417",
                    name: "Barcode Number",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "357",
                    name: "Baseline or Exposed",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "58",
                    name: "batch",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "174",
                    name: "Bioreactor",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "239",
                    name: "Biotic response",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "441",
                    name: "Bird_Breed",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "405",
                    name: "Birth year",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "148",
                    name: "BisulfiteTreated",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "61",
                    name: "BisulfiteTreated",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "192",
                    name: "Block ID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "21",
                    name: "Brain Region",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "60",
                    name: "Breed",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "381",
                    name: "buccal sab",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "367",
                    name: "Buffer",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "366",
                    name: "Buffer, RNase",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "316",
                    name: "Bulk Segregant Analysis",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "262",
                    name: "Cacul",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "227",
                    name: "Cancer Status",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "258",
                    name: "Capture Reagent",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "451",
                    name: "Capture System",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "114",
                    name: "CC_Number",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "372",
                    name: "CCCP",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "147",
                    name: "Cell Line / Strain",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: "Lymphoblastoid cell"
                },
                {
                    idProperty: "2",
                    name: "Cell Line / Strain",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: "Lymphoblastoid cell"
                },
                {
                    idProperty: "3",
                    name: "Cell Type",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: "human gastric adenocarcinoma cells"
                },
                {
                    idProperty: "101",
                    name: "Cells expressing H1-H7 versus cells lacking H1&amp;H2",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "203",
                    name: "Cells expressing p53 or c-myc vs null cells",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "49",
                    name: "Chip",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "347",
                    name: "Cleanup",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "4",
                    name: "Clinical Information",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "401",
                    name: "CNS 1",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "402",
                    name: "CNS 2",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "449",
                    name: "Collection alias",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "400",
                    name: "ColocareID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "336",
                    name: "Columbicola columbae",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "180",
                    name: "Comments",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "5",
                    name: "Compound",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "159",
                    name: "Conc by NanoDrop (ng/ul)",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "428",
                    name: "Control (1)",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "429",
                    name: "Control (2)",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "247",
                    name: "Control siRNA",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "220",
                    name: "Control vs. parasitized, multiple source pops",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "183",
                    name: "Core ID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "326",
                    name: "cortical organoid",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "423",
                    name: "CPM Isolate seq",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "327",
                    name: "CRSPR insert",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "150",
                    name: "Custom index tag",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "13",
                    name: "Custom index tag",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: "Sample 1 - U701    TCGCCTTA&#xD;Sample 2 - U702    CTAGTACG&#xD;Sample 3 - U703    TTCTGCCT&#xD;Sample 4  - U704    GCTCAGGA&#xD;Sample 5 - U705    AGGAGTCC&#xD;Sample 6 - U706    CATGCCTA&#xD;Sample 7 - U707    GTAGAGAG&#xD;Sample 8 - U709    AGCGTAGC"
                },
                {
                    idProperty: "396",
                    name: "Date",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "343",
                    name: "Day",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "317",
                    name: "Day post admission",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "344",
                    name: "Day, P",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "118",
                    name: "Diet",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "305",
                    name: "DIN",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "279",
                    name: "Disease",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "6",
                    name: "Disease State / Stage / Tumor Grade",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "289",
                    name: "Diseased/Healthy",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "278",
                    name: "Diseases Severity",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "112",
                    name: "DNA SELEX Libraries",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "7",
                    name: "Dose",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "439",
                    name: "Dovetail Hi-C Library",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "235",
                    name: "DOX treated dnFGFR2b",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "50",
                    name: "Drug inhibition",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "254",
                    name: "drug resistance",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "351",
                    name: "DS",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "238",
                    name: "DTA-treated",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "284",
                    name: "Early Onset Prostate Cancer",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "414",
                    name: "Enter Custom Annotation Name Here..",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "413",
                    name: "EOK",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "93",
                    name: "exosomes",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "242",
                    name: "Experiment",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "450",
                    name: "Experiment Replicate number ",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "241",
                    name: "Experimental replicate number",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "356",
                    name: "Exposed VS Baseline",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "231",
                    name: "F1 parent",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "256",
                    name: "Fetal growth restriction ",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "422",
                    name: "fetal start no vent",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "48",
                    name: "FFPE",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "187",
                    name: "Footprint Sample",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "261",
                    name: "Fraction",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "352",
                    name: "FW",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "277",
                    name: "Gender",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "266",
                    name: "gene",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "106",
                    name: "Generation",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "8",
                    name: "Genetic Modification",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "337",
                    name: "Genome annotation",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "301",
                    name: "genome assembly",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "9",
                    name: "Genotype",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: "2C"
                },
                {
                    idProperty: "121",
                    name: "Genotype",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: "2C"
                },
                {
                    idProperty: "123",
                    name: "Genotype",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "2",
                    description: "2C"
                },
                {
                    idProperty: "433",
                    name: "GID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "250",
                    name: "GlcNAc",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "53",
                    name: "grafting",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "109",
                    name: "Group",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "272",
                    name: "Group (control vs. KD)",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "331",
                    name: "Group ID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "10",
                    name: "Growth Conditions",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "435",
                    name: "Harvest Date",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "111",
                    name: "HCI Person ID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "370",
                    name: "HCI-2509 tx",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "82",
                    name: "HealthyVsDiseased",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "182",
                    name: "Human Blood Cells",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "382",
                    name: "human Buccal",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "415",
                    name: "Human Fibroblasts",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "245",
                    name: "Human Retinal Microvascular Endothelial Cells",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "265",
                    name: "Human Sperm RNA",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "27",
                    name: "Human_5hmC",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "270",
                    name: "HUVEC",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "335",
                    name: "i5 Index",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "334",
                    name: "i7 Index",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "406",
                    name: "ID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "298",
                    name: "in",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "199",
                    name: "Index",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "209",
                    name: "Index Tag B",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "11",
                    name: "Individual",
                    otherLabel: "",
                    isSelected: "true",
                    isRequired: "true",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: "2014_01"
                },
                {
                    idProperty: "195",
                    name: "Input (mg)",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "368",
                    name: "Input Control",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "340",
                    name: "ishikawa",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "426",
                    name: "Isolation date",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "427",
                    name: "Isolation Method",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "285",
                    name: "Isoline",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "214",
                    name: "IUGR HFD Female F-1",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "168",
                    name: "Lane",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "158",
                    name: "LCM",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "260",
                    name: "libary pooling group",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "117",
                    name: "Library",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "454",
                    name: "Library Code",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "282",
                    name: "Library prep method",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "264",
                    name: "Library_Prep",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "234",
                    name: "Limb Type",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "167",
                    name: "lung, brain, CD4+ T-cells UL28-15MV",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "288",
                    name: "MAIT",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "156",
                    name: "MAIT activation",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "62",
                    name: "MARs",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "328",
                    name: "mate pair library",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "315",
                    name: "Menidia menidia",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "446",
                    name: "metadata",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "157",
                    name: "metagenome",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "161",
                    name: "Metatranscriptome for bioreactors",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "249",
                    name: "microorganism",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "432",
                    name: "MLE-15 cells",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "314",
                    name: "mouse",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "52",
                    name: "Mouse ID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "306",
                    name: "mouse model",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "165",
                    name: "mouse otic vesicle_dnFGFR2b and control",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "390",
                    name: "MOuse PFA",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "362",
                    name: "Mouse Strain",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "363",
                    name: "Mouse Strain, P",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "365",
                    name: "Mouse Strain, Passage",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "342",
                    name: "Mouse, P",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "395",
                    name: "MPC Inhibitor",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "321",
                    name: "MRA",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "323",
                    name: "MRA (Batch 1)",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "324",
                    name: "MRA (Batch 2)",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "113",
                    name: "MRN_HCI_PID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "410",
                    name: "Multiplex Group",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "392",
                    name: "mutant vs WT",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "349",
                    name: "my new annotation",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "371",
                    name: "Name",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "56",
                    name: "NDAR-id",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "404",
                    name: "NEBNext i500 id",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "403",
                    name: "NEBNext i700 id",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "312",
                    name: "Need 8 base barcode!",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "374",
                    name: "Neonatal Rat Ventricular Myocytes",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "88",
                    name: "Nestin-TVA",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "177",
                    name: "Nextera3_GNomEx_ID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "205",
                    name: "ng DNA",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "411",
                    name: "NHS",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "55",
                    name: "NIMH-id",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "421",
                    name: "non invasive vent",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "304",
                    name: "Non-Transgenic",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "255",
                    name: "Normal",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "63",
                    name: "Normal / Lymph node / FFPE",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "419",
                    name: "normal term lamb",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "236",
                    name: "Normal term lamb female lung, brain, CD4+",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "257",
                    name: "Normally grown",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "39",
                    name: "Notes",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: "Translational oncology core notes"
                },
                {
                    idProperty: "78",
                    name: "Oocyte",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "12",
                    name: "Organ / Tissue",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: "Skeletal muscle biopsy, frozen 40 uM sections"
                },
                {
                    idProperty: "299",
                    name: "out",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "186",
                    name: "P. aeruginosa Strain",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "232",
                    name: "P0 Parent",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "329",
                    name: "Paired-end 500bp",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "14",
                    name: "Patient ID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "375",
                    name: "PBMCs",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "70",
                    name: "PDX ID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "54",
                    name: "pedigree",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "115",
                    name: "Phenotype",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "443",
                    name: "Picture_Number",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "307",
                    name: "Plasmid",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "66",
                    name: "Plate",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "259",
                    name: "Plate name",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "434",
                    name: "PlatePosition",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "64",
                    name: "Polycythemia",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "104",
                    name: "Pool",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "76",
                    name: "Pooled amplicons following bisulfite treatment",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "425",
                    name: "PooledAmplicons",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "105",
                    name: "Population",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "92",
                    name: "Previous Sample ID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "91",
                    name: "Previous sequencing run",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "378",
                    name: "PrimerID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "283",
                    name: "Prostate Cancer",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "333",
                    name: "protoplast RNA",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "218",
                    name: "QC ID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "230",
                    name: "Qubit",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "389",
                    name: "Rat Surgical",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "83",
                    name: "Ratio(260/280)",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "281",
                    name: "Region",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "170",
                    name: "Rep",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "286",
                    name: "Replicate",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "311",
                    name: "Response",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "376",
                    name: "Riboseq/RNAseq",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "171",
                    name: "Ribosome Profiling with RiboZero",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "84",
                    name: "RIN(Bioanalyzer)",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "181",
                    name: "RIN/DIN",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "380",
                    name: "RNA Conc (ng/ul)",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "438",
                    name: "Roche",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "346",
                    name: "RT Primer",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "345",
                    name: "RT Primer Conc",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "300",
                    name: "sac",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "407",
                    name: "Sample",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "408",
                    name: "Sample Conc.",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "90",
                    name: "Sample date",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "160",
                    name: "Sample ID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "280",
                    name: "Sample ID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "339",
                    name: "Sample Identifier",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "325",
                    name: "Sample Name",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "59",
                    name: "sample quality IDs",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "409",
                    name: "Sample Volume",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "360",
                    name: "SC 196",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "361",
                    name: "SC 274",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "47",
                    name: "Secondary ID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "271",
                    name: "Sediment concentrations",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "37",
                    name: "Sequenom Plate #",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: "Sequenom Plate #"
                },
                {
                    idProperty: "15",
                    name: "Sex",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "228",
                    name: "Shadow ID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "155",
                    name: "Shadow_ID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "397",
                    name: "sheep Hi-C",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "377",
                    name: "sheep R21 ATAC-seq brain lung CD4+",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "436",
                    name: "Significant",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "253",
                    name: "Single Cell Count",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "318",
                    name: "single embryo",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "383",
                    name: "Sister Compare",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "384",
                    name: "Sister compare methylome",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "248",
                    name: "size",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "110",
                    name: "Small RNA",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "386",
                    name: "Sort Date",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "237",
                    name: "Sorted cell total RNA",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "57",
                    name: "source",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "442",
                    name: "Source_Vial_Number",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "98",
                    name: "Species",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "151",
                    name: "Species",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "191",
                    name: "Stable/Unstable",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "233",
                    name: "Stage",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "246",
                    name: "STAT3 siRNA",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "424",
                    name: "Study",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "364",
                    name: "Subline",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "287",
                    name: "SW480",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "387",
                    name: "T",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "100",
                    name: "T cells",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "198",
                    name: "TagSet Lot#",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "80",
                    name: "tandom small RNA",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "67",
                    name: "Target",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "149",
                    name: "Target",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "359",
                    name: "Target Taxa",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "16",
                    name: "Temperature",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "369",
                    name: "test",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "398",
                    name: "testannot",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "444",
                    name: "Time",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "17",
                    name: "Time Course",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "358",
                    name: "Timepoint",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "399",
                    name: "timtestannot",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "313",
                    name: "Tissue",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "430",
                    name: "TNFa (1)",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "431",
                    name: "TNFa(2)",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "188",
                    name: "Total RNA Sample",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "418",
                    name: "Total volume (ul)",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "445",
                    name: "Total_DNA",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "338",
                    name: "Transcriptome",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "303",
                    name: "Transgenic",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "146",
                    name: "Treatment",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "107",
                    name: "Treatment",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "453",
                    name: "Treatment and time point",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "89",
                    name: "Treatment Hypoxia",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "69",
                    name: "Treatment Time ",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "68",
                    name: "Treatment/Control",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "97",
                    name: "Triplet samples T/N/AD",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "452",
                    name: "Triplicate number",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "394",
                    name: "Tube Number",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "145",
                    name: "Tumor ID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "51",
                    name: "Tumor ID",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "116",
                    name: "Tumor region",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "164",
                    name: "Tumor Size",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "437",
                    name: "TWIST",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "373",
                    name: "Type",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "341",
                    name: "Type",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3",
                    description: ""
                },
                {
                    idProperty: "244",
                    name: "VEGF",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "310",
                    name: "venom gland",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "204",
                    name: "Volume",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "240",
                    name: "Well",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "263",
                    name: "wild type zebrafish embryo H2A-Ub1 ChIP 5.3 hpf ",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "320",
                    name: "WT",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "322",
                    name: "WT (Batch 1)",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "319",
                    name: "WT STH1 vs MRAs",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "243",
                    name: "x chromosome",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "206",
                    name: "Yeast-MNase/ChIP",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "309",
                    name: "zebrafish ",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "212",
                    name: "Zebrafish bap1 mutant and WT samples",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "86",
                    name: "Zebrafish Development",
                    otherLabel: "",
                    isSelected: "false",
                    isRequired: "false",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "1",
                    description: ""
                },
                {
                    idProperty: "200",
                    name: "Barcode",
                    otherLabel: "",
                    isSelected: "false"
                },
                {
                    idProperty: "268",
                    name: "Barcode ID",
                    otherLabel: "",
                    isSelected: "false"
                },
                {
                    idProperty: "267",
                    name: "Barcode reverse complement",
                    otherLabel: "",
                    isSelected: "false"
                },
                {
                    idProperty: "269",
                    name: "Barcode sequence",
                    otherLabel: "",
                    isSelected: "false"
                },
                {
                    idProperty: "44",
                    name: "Custom index tag 2",
                    otherLabel: "",
                    isSelected: "false"
                },
            ],
            RequestProperties:       [
                {
                    idProperty: "448",
                    idPropertyEntry: "",
                    name: "Describe ddPCR Assay Conditions",
                    description: "",
                    value: "",
                    codePropertyType: "TEXT",
                    otherLabel: "",
                    isRequired: "Y",
                    isSelected: "true",
                    sortOrder: "1",
                    isActive: "Y",
                    idCoreFacility: "3"
                },
                {
                    idProperty: "153",
                    idPropertyEntry: "",
                    name: "Describe Digital Droplet Assay Conditions",
                    description: "",
                    value: "",
                    codePropertyType: "TEXT",
                    otherLabel: "",
                    isRequired: "Y",
                    isSelected: "true",
                    sortOrder: "1",
                    isActive: "Y",
                    idCoreFacility: "3"
                },
                {
                    idProperty: "162",
                    idPropertyEntry: "",
                    name: "RNA Cleanup",
                    description: "If isolating RNA, would you like the core to perform an additional in solution DNase I treatment of the RNA post extraction, followed by a RNeasy MinElute cleanup?  HIGHLY RECOMMENDED if performing RIBO-Zero RNA Sequencing or using the RNA for applications where trace DNA contamination can impact the experimental results. Cost $10 per Sample ($20 External).",
                    value: "",
                    codePropertyType: "OPTION",
                    otherLabel: "",
                    isRequired: "Y",
                    isSelected: "true",
                    sortOrder: "1",
                    isActive: "Y",
                    idCoreFacility: "3",
                    PropertyOption : [
                        {
                            idPropertyOption: "73",
                            name: "Yes",
                            selected: "N"
                        },
                        {
                            idPropertyOption: "74",
                            name: "No",
                            selected: "N"

                        }
                    ]
                },
                {
                    idProperty: "456",
                    idPropertyEntry: "",
                    name: "zzz temp annotation",
                    description: "",
                    value: "",
                    codePropertyType: "TEXT",
                    otherLabel: "",
                    isRequired: "N",
                    isSelected: "true",
                    sortOrder: "1",
                    isActive: "Y",
                    idCoreFacility: "1"
                },
                {
                    idProperty: "152",
                    idPropertyEntry: "",
                    name: "Core to Covaris shear your DNA sample?",
                    description: "High quality intact DNA from cell lines, blood, fresh/frozen tissue, etc will need to be fragmented on the Covaris and concentrated prior to analysis.",
                    value: "",
                    codePropertyType: "CHECK",
                    otherLabel: "",
                    isRequired: "Y",
                    isSelected: "true",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3"
                },
                {
                    idProperty: "447",
                    idPropertyEntry: "",
                    name: "Core to shear your DNA sample",
                    description: "High quality intact DNA from cell lines, blood, fresh/frozen tissue, etc will need to be fragmented on the Covaris and concentrated prior to analysis.",
                    value: "",
                    codePropertyType: "CHECK",
                    otherLabel: "",
                    isRequired: "Y",
                    isSelected: "true",
                    sortOrder: "999999",
                    isActive: "Y",
                    idCoreFacility: "3"
                }
            ],
        };

        return experiment;
    }

    public saveNewRequest(idProject: number, invoicePrice: string, description: string, experiment: any, properties: any[]): Observable<any> {

        let idProject_param:    string = '';
        let invoicePrice_param: string = '';
        let description_param:  string = '';
        let experiment_param:   string = '';
        let properties_param:   string = '';

        if (idProject !== undefined && idProject !== null) {
            idProject_param = '' + idProject;
        }
        if (invoicePrice !== undefined && invoicePrice !== null) {
            invoicePrice_param = '' + invoicePrice;
        }
        if (description !== undefined && description !== null) {
            description_param = '' + description;
        }
        if (experiment !== undefined && experiment !== null) {
            experiment_param = '' + JSON.stringify(experiment);
        }
        if (properties !== undefined && properties !== null) {
            properties_param = '' + JSON.stringify(properties);
        }

        let headers: HttpHeaders = new HttpHeaders().set('Content-Type','application/x-www-form-urlencoded');

        let params: HttpParams = new HttpParams()
            .set('description',       description_param)
            .set('idProject',         idProject_param)
            .set('invoicePrice',      invoicePrice_param)
            .set('propertiesXML',     properties_param)
            .set('requestJSONString', experiment_param);

        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/SaveRequest.gx", params.toString(), { headers:headers })
    }


    // Sort application by sortOrder field
    private static sortApplication(obj1, obj2): number {
        if (obj1 === null && obj2 === null) {
            return 0;
        } else if (obj1 === null) {
            return 1;
        } else if (obj2 === null) {
            return -1;
        } else {
            let order1: number = obj1.sortOrder;
            let order2: number = obj2.sortOrder;
            let disp1: string = obj1.display;
            let disp2: string = obj2.display;

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

    refreshNewExperimentAnnotations(): void {
        this.dialogService.startDefaultSpinnerDialog();

        this.experimentService.getNewRequest().pipe(first()).subscribe((response: any) => {
            this.dialogService.stopAllSpinnerDialogs();

            if (!response) {
                return;
            }

            if (!this.gnomexService.isInternalExperimentSubmission) {
                this.addDescriptionFieldToAnnotations(response.PropertyEntries);
            }

            this.propertyEntries = response.PropertyEntries;

            if (response.RequestProperties && Array.isArray(response.RequestProperties)) {
                this.annotations = response.RequestProperties.filter(annotation =>
                    annotation.isActive === 'Y' && annotation.idCoreFacility === this.idCoreFacility
                );
            } else {
                this.annotations = [];
            }
        });

        this.propertyEntriesForUser = this.filterPropertiesByUser(this.propertyEntries);
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
            if (NewExperimentService.isEntered(s2, "numberSequencingLanes")) {
                numberOfAdditionalLanes += s2.numberSequencingLanes;
            }
        }
        let completeCount: number = 0;
        // let nameCompleteCount: number = 0;

        for (let sample of this.samplesGridRowData) {

            if (NewExperimentService.isEntered(sample, "name")
                && NewExperimentService.isEntered(sample, "idSampleType")
                && NewExperimentService.isEntered(sample, "idOrganism")
                && NewExperimentService.isEntered(sample, "idSeqRunType")
                && NewExperimentService.isEntered(sample, "idNumberSequencingCycles")
                && NewExperimentService.isEntered(sample, "idNumberSequencingCyclesAllowed")
                && NewExperimentService.isEntered(sample, "multiplexGroupNumber")
                && NewExperimentService.isEntered(sample, "numberSequencingLanes")
                && numberOfAdditionalLanes > 0) {
                completeCount++;
            }

        }
        let isValidNumberSeqLanes: boolean = true;
        if (isValidNumberSeqLanes) {
            let lanesAdded:Boolean = false;

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
                    if (numberOfLanes !== -1 && theLanes.length === numberOfLanes) {
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


    private static isEntered(sample: any, fieldName: string): boolean {
        return sample && (sample.hasOwnProperty(fieldName) && ('' + sample[fieldName]) !== '');
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
            let doesMatchRequestCategory: boolean = false;
            let theApplications = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.RequestCategoryApplication").filter((reqCatApp) => {
                    return reqCatApp.value !== "" && reqCatApp.codeApplication === app.value;
            });

            for (let xref of theApplications) {
                if (xref.codeRequestCategory === requestCategory.codeRequestCategory) {
                    doesMatchRequestCategory = true;
                    break;
                }
            }

            let doesMatchSeqPrepByCore: boolean = false;
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


    // public filterNumberSequencingCyclesAllowed(cycles: any[], requestCategory: any): any[] {
    //     if (!cycles || !Array.isArray(cycles) || !requestCategory) {
    //         return [];
    //     }
    //
    //     let seqCycles: any[] = [];
    //
    //     for (let cycle of cycles) {
    //         if (cycle.value && cycle.codeRequestCategory === requestCategory.codeRequestCategory && cycle.isActive.toString() === 'Y') {
    //             seqCycles.push(cycle);
    //         }
    //     }
    //
    //     return seqCycles;
    // }

    public getOrganism(): any {
        if (this.sampleSetupView && (this.isMicroarrayState() || this.isSolexaState()) && this.currentState !== 'SolexaLaneAmendState') {
            return this.sampleSetupView.form.get("organism").value;
        } else if (this.request != null) {
            let idOrganism = null;
            if (this.request.idOrganismSampleDefault && this.request.idOrganismSampleDefault !== '') {
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
        let appPriceListParams: HttpParams = new HttpParams()
            .set("codeRequestCategory" ,this.requestCategory.codeRequestCategory)
            .set("idLab", this.lab.idLab);

        this.billingService.getHiSeqRunTypePriceList(appPriceListParams).subscribe((response: any) => {
            // this.hiSeqPrices = response;

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

        if (AnnotationService.isApplicableProperty(property, this.requestCategory, idOrganism, this.codeApplication)
            && (sce.isSelected === 'true' || property.isActive !== 'N')) {

            keep = true;
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

        if (propsToFilter) {
            for (let property of propsToFilter) {
                if (property.name.startsWith("mSelect")) {
                    console.log("jj");
                }
                let entry: any = this.gnomexService.getSampleProperty(property.idProperty);
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

    public getSubmitterName(): string {
        if (this.experimentOwner) {
            return this.experimentOwner.displayName;
        } else {
            return this.securityAdvisor.userName;
        }
    }
}

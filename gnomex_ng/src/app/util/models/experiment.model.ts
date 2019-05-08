import {BehaviorSubject, Subject} from "rxjs/index";

import {Sample} from "./sample.model";

import {AnnotationService} from "../../services/annotation.service";
import {DictionaryService} from "../../services/dictionary.service";
import {GnomexService} from "../../services/gnomex.service";
import {PropertyService} from "../../services/property.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";

export class Experiment {

    public name:                               string = "";
    public number:                             string = "";
    public description:                        string = "";
    public codeProtocolType:                   string = "";
    public corePrepInstructions:               string = "";
    public analysisInstructions:               string = "";
    public captureLibDesignId:                 string = "";
    public avgInsertSizeFrom:                  string = "";
    public avgInsertSizeTo:                    string = "";
    public idSlideProduct:                     string = "";
    public protocolNumber:                     string = "";

    public get numberOfSamples(): string {
        return this._numberOfSamples;
    }
    public set numberOfSamples(value: string) {
        this._numberOfSamples = value;
        this.onChange_numberOfSamples.next(value);
    }
    private _numberOfSamples:                    string = ''; // "0",
    public onChange_numberOfSamples: Subject<string> = new Subject<string>();

    public idSampleTypeDefault:                string = ''; // "1"

    private _sampleType: any;
    public get sampleType(): any {
        return this._sampleType;
    }
    public set sampleType(value: any) {

        for (let sample of this.samples) {
            sample.sampleType = value;
        }

        this._sampleType = value;
        this.onChange_sampleType.next(value);
    }
    public onChange_sampleType: Subject<string> = new Subject<string>();


    private _idSampleSource: string = '';
    public get idSampleSource(): string {
        return this._idSampleSource;
    }
    public set idSampleSource(value: string) {

        for (let sample of this.samples) {
            sample.idSampleSource = value;
        }

        this._idSampleSource = value;
        this.onChange_idSampleSource.next(value);
    }
    public onChange_idSampleSource: BehaviorSubject<string> = new BehaviorSubject<string>('');


    public bioinformaticsAssist:               string = "";
    public idOrganismSampleDefault:            string = ''; // "204"
    public isArrayINFORequest:                 string = "";
    public canDeleteSample:                    string = "Y";
    public canUpdateSamples:                   string = "Y";
    public isVisibleToMembers:                 string = ''; // "Y",
    public isVisibleToPublic:                  string = ''; // "N"
    public lastModifyDate:                     string = "";
    public codeRequestStatus:                  string = "";
    public idSampleDropOffLocation:            string = "";
    public submitterEmail:                     string = "";
    public submitterPhone:                     string = "";
    public submitterInstitution:               string = "";
    public isDNASeqExperiment:                 string = ''; // "N"
    public applicationNotes:                   string = "";
    public coreToExtractDNA:                   string = ''; // "N"
    public processingDate:                     string = "";
    public codeIsolationPrepType:              string = "";
    public hasPrePooledLibraries:              string = "";
    public numPrePooledTubes:                  string = "";
    public includeBisulfideConversion:         string = ''; // "N",
    public includeQubitConcentration:          string = ''; // "N"
    public turnAroundTime:                     string = "";
    public _idCoreFacility:                     string = ''; // "1"
    public get idCoreFacility(): string {
        return this._idCoreFacility;
    }
    public set idCoreFacility(value: string) {
        this._idCoreFacility = value;

        if (this.RequestProperties) {
            this.filterRequestProperties();
        }
    }

    public idProductOrder:                     string = "";

    public truncatedLabName:                   string = "";

    private _idLab:                              string = ''; // "1125",
    public get idLab(): string {
        return this._idLab;
    }
    public set idLab(value: string) {
        this._idLab = value;
        this.onChange_idLab.next(value);
    }
    public onChange_idLab: Subject<string> = new Subject<string>();

    private _lab: any;
    public get lab(): any {
        return this._lab;
    }
    public set lab(value: any) {
        this._lab = value;

        this._idLab = '';
        if (value && value.idLab) {
            this._idLab = value.idLab;
        }
        if (value && value.display) {
            this.labName = value.display;
        }
        this.onChange_idLab.next(this._idLab);
    }
    public refreshIdLab(): void {
        this.onChange_idLab.next(this._idLab);
    }

    public _labName_notReturned:               string = "";
    public get labName(): string {
        return "";  // always passes the empty string to SaveRequest (?)
    }
    public set labName(value: string) {
        this._labName_notReturned = value;
    }

    public idRequest:                          string = "0"; // idRequest === 0 indicates to the backend that this is a new Request.

    private _experimentOwner: any;

    public get experimentOwner() {
        return this._experimentOwner;
    }
    public set experimentOwner(value: any) {
        if (value && value.idAppUser) {
            this._experimentOwner = value;
            this.idAppUser            = value.idAppUser;
            this.idSubmitter          = value.idAppUser;
            this.submitterName        = value.displayName;
            this.submitterEmail       = value.email;
            this.submitterPhone       = value.phone;
            this.submitterInstitution = value.institution;
        } else {
            // TODO replace check with typing
            //throw { message: 'Bad experiment owner!!!' };
            this._experimentOwner = null;
            this.idAppUser = null;
        }
    }

    public idAppUser:                          string = ''; // "4777", // I believe this is the idAppUser of the submitter, which may not be the same as the user
    public idOwner:                            string = ''; // ??? Inserted by new experiment?
    public createDate:                         string = "";
    public completedDate:                      string = "";
    public notes:                              string = "";
    public application:                        string = "";
    public projectName:                        string = "";
    public idProject:                          string = ''; // "62962"
    public project:                            any;
    public slideProduct:                       string = "";
    public isExternal:                         string = ''; // "N",
    public requestStatus:                      string = "";
    public reagent:                            string = ''; // "asdf"
    public elutionBuffer:                      string = ''; // "fdsa",
    public usedDnase:                          string = "";
    public usedRnase:                          string = "";
    public keepSamples:                        string = ''; // "Y"

    public seqPrepByCore_forSamples:           string = "";
    public get seqPrepByCore(): string {
        // The sample should always return "", but save what the choice was in case we
        // save more samples, because samples save this information individually (???)
        return "";
    }
    public set seqPrepByCore(value: string) {
        this.seqPrepByCore_forSamples = value ? value : '';

        for (let sample of this.samples) {
            sample.seqPrepByCore = this.seqPrepByCore_forSamples;
        }
    }

    public extractionMethod_forSamples:        string = "";
    public get extractionMethod(): string {
        // The sample should always return "", but save what the choice was in case we
        // save more samples, because samples save this information individually (???)
        return "";
    }
    public set extractionMethod(value: string) {
        this.extractionMethod_forSamples = value ? value : '';

        for (let sample of this.samples) {
            sample.otherSamplePrepMethod = this.extractionMethod_forSamples;
        }
    }

    public adminNotes:                         string = "";
    public archived:                           string = "";

    private _codeRequestCategory:                string = ''; // "NOSEQ",
    public get codeRequestCategory() {
        return this._codeRequestCategory;
    }
    public set codeRequestCategory(value: string) {
        this._codeRequestCategory = value;

        if (value) {
            this.requestCategory = this.dictionaryService.getEntry('hci.gnomex.model.RequestCategory', value);
        } else {
            this.requestCategory = null;
        }

        this.onChange_codeRequestCategory.next(this.codeRequestCategory);
    }
    public onChange_codeRequestCategory: BehaviorSubject<string> = new BehaviorSubject<string>(this.codeRequestCategory);

    private _requestCategory: any;
    public get requestCategory(): any {
        return this._requestCategory;
    }
    public set requestCategory(value: any) {
        this._requestCategory = value;
        this._codeRequestCategory = null;

        if (value && value.codeRequestCategory) {
            this._codeRequestCategory = value.codeRequestCategory;
        }

        this.onChange_codeRequestCategory.next(this._codeRequestCategory);
        this.onChange_requestCategory.next(this._requestCategory);
    }
    public onChange_requestCategory: BehaviorSubject<any>        = new BehaviorSubject<any>(this.requestCategory);

    public privacyExpirationDate:              string = "";
    public targetClassIdentifier:              string = "0";
    public targetClassName:                    string = "hci.gnomex.model.Request";

    private _codeApplication:                    string = ''; // "APP198",
    public get codeApplication():string {
        return this._codeApplication;
    }
    public set codeApplication(value: string) {
        this._codeApplication = value;
        this.onChange_codeApplication.next(value);
    }
    public onChange_codeApplication: BehaviorSubject<string> = new BehaviorSubject<string>('');

    private _application: any;
    public get application_object(): any {
        return this._application;
    }
    public set application_object(value: any) {
        this._application = value;

        if (value) {
            this.codeApplication = value.codeApplication;
            this.application = value.display;
        }

        for (let sample of this.samples) {
            sample.application_object = value;
        }

        this.application_object_changed.next(value);
    }
    public application_object_changed: Subject<any> = new Subject<any>();

    private _codeBioanalyzerChipType: string = "";
    public get codeBioanalyzerChipType(): string {
        return '' + this._codeBioanalyzerChipType;
    };
    public set codeBioanalyzerChipType(codeBioanalyzerChipType: string) {
        this._codeBioanalyzerChipType = codeBioanalyzerChipType;
        this.onChange_codeBioanalyzerChipType.next(this._codeBioanalyzerChipType);

        for (let sample of this.samples) {
            sample.codeBioanalyzerChipType = this._codeBioanalyzerChipType;
        }
    };
    public onChange_codeBioanalyzerChipType: BehaviorSubject<any> = new BehaviorSubject<any>('');

    public codeVisibility:                     string = ''; // "MEM",
    public canUpdateVisibility:                string = ''; // "N",
    public isVisibleToMembersAndCollaborators: string = ''; // "N",
    public idProduct:                          string = "";
    public canRead:                            string = ''; // "Y",
    public canUploadData:                      string = ''; // "N",
    public canDelete:                          string = ''; // "Y",
    public ownerName:                          string = "";
    public idInstitution:                      string = "";
    public idSubmitter:                        string = ''; // "4777",
    public canUpdate:                          string = ''; // "Y",
    public submitterName:                      string = "";
    public projectDescription:                 string = "";
    public accountNumberDisplay:               string = "";
    public idOrganism:                         string = "";
    public organismName:                       string = "";
    public otherOrganism:                      string = "";
    public hasCCNumber:                        string = ''; // "N",
    public hasSampleDescription:               string = ''; // "N",
    public hasPlates:                          string = ''; // "N",
    public isOpeningNewBillingTemplate:        string = ''; // "N"

    private _isRapidMode:                        string = ''; // "N"
    public get isRapidMode(): string {
        return this._isRapidMode;
    }
    public set isRapidMode(value: string) {
        this._isRapidMode = value;

        let result: string = value && value === 'Y' ? '2' : '1';

        for (let sample of this.samples) {
            sample.numberSequencingLanes = result;
        }
    }

    // Really this will always return a Sample[]...
    public get samples(): any|any[] {
        return this._samples
    }
    public set samples(value :any|any[]) {
        if (!value) {
            this._samples = [];
        }
        if (!Array.isArray(value)) {
            value = [value.Sample]
        }

        let temp = [];
        for (let sample of value){
            if (sample instanceof Sample) {
                temp.push(sample);
            } else {
                temp.push(Sample.createSampleObjectFromAny(this.dictionaryService, sample));
            }
        }
    }
    public _samples:                 Sample[] = [];

    public hybridizations:          any[] = [];
    public labeledSamples:          any[] = [];
    public analysisExperimentItems: any[] = [];
    public seqLibTreatments:        any[] = [];
    public files:                   any[] = [];
    public collaborators:           any[] = [];
    public workItems:               any[] = [];
    public billingItems:            any[] = [];
    public SeqLibTreatmentEntries:  any[] = [];
    public protocols:               any[] = [];
    public sequenceLanes:           any[] = [];

    // PropertyEntries should probably be named something more like "SampleAnnotationTemplates".
    public _PropertyEntries:         any[] = [];
    public get PropertyEntries(): any[] {
        return this._PropertyEntries;
    };
    // setting PropertyEntries is not recommended, it should be loaded from the backend via refreshSampleAnnotationList
    public set PropertyEntries(value: any[]) {
        this._PropertyEntries = value;

        if (this._PropertyEntries) {
            this._PropertyEntries = this._PropertyEntries.sort(AnnotationService.sortProperties);
        }

        this.onChange_PropertyEntries.next(this.PropertyEntries);
    }
    public onChange_PropertyEntries: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(this.PropertyEntries);
    public refreshPropertyEntries(): void {
        this.onChange_PropertyEntries.next(this.PropertyEntries);
    }

    private _PropertyEntries_original: any[];


    private _RequestProperties:       any[] = [];
    public get RequestProperties(): any[] {
        return this._RequestProperties;
    }
    public set RequestProperties(value: any[]) {
        this._RequestProperties = value;

        if (this.idCoreFacility) {
            this.filterRequestProperties();
        }

        this.onChange_RequestProperties.next(this.RequestProperties);
    }
    public onChange_RequestProperties: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(this.RequestProperties);

    private _organism: any = {};
    public get organism(): any {
        return this._organism;
    }
    public set organism(value: any) {
        if (value && value.idOrganism && value.display) {
            this._organism = value;
            this.idOrganism = value.idOrganism;
            this.organismName = value.display;

            for (let sample of this.samples) {
                sample.organism = value;
            }

            this.filterRequestProperties();
            this.refreshSampleAnnotationList();

            this.onChange_organism.next(value);
        }
    }
    public onChange_organism: BehaviorSubject<any> = new BehaviorSubject<any>(this.organism);

    private _topics: any[] = [];
    public get topics(): any[] {
        return this._topics;
    }
    public set topics(value: any[]) {
        if (value && Array.isArray(value)) {
            this._topics = value;
        } else {
            this._topics = [];
        }
    }

    private _sequencingOption: any;
    public get sequencingOption(): any {
        return this._sequencingOption;
    }
    public set sequencingOption(value: any) {
        if (value && value.idNumberSequencingCycles && value.idNumberSequencingCyclesAllowed) {
            this._sequencingOption = value;

            for (let sample of this.samples) {
                sample.sequencingOption = value;
            }

            this.sequencingOption_changed.next(value);
        }
    }
    public sequencingOption_changed: Subject<any> = new Subject<any>();


    private _selectedProtocol: any;
    public get selectedProtocol(): any {
        return this._selectedProtocol;
    }
    public set selectedProtocol(value: any) {
        this._selectedProtocol = value;

        if (this._selectedProtocol) {
            for (let sample of this.samples) {
                sample.idNumberSequencingCycles        = this._selectedProtocol.idNumberSequencingCycles;
                sample.idNumberSequencingCyclesAllowed = this._selectedProtocol.idNumberSequencingCyclesAllowed;
            }
            for (let lane of this.sequenceLanes) {
                lane.idNumberSequencingCycles        = this._selectedProtocol.idNumberSequencingCycles;
                lane.idNumberSequencingCyclesAllowed = this._selectedProtocol.idNumberSequencingCyclesAllowed;
            }
        }

        this.onChange_selectedProtocol.next(value);
    }
    public onChange_selectedProtocol: BehaviorSubject<any> = new BehaviorSubject<any>(this.selectedProtocol);


    public billingAccountName:                 string = "";
    public billingAccountNumber:               string = "";
    public idBillingAccount:                   string = ''; // "9246",
    private _billingAccount: any;

    public get billingAccount(): any {
        return this._billingAccount;
    }
    public set billingAccount(value: any) {
        this._billingAccount = value;

        if (value) {
            this.idBillingAccount = value.idBillingAccount;
            this.billingAccountName = value.accountName;
            this.billingAccountNumber = value.accountNumber;
        }

        this.onChange_billingAccount.next(value);
    }

    public onChange_billingAccount: Subject<any> = new Subject<any>();


    constructor(private dictionaryService: DictionaryService,
                private gnomexService: GnomexService,
                private propertyService: PropertyService,
                private securityAdvisor: CreateSecurityAdvisorService) { }


    public static createExperimentObjectFromAny(dictionaryService: DictionaryService,
                                                gnomexService: GnomexService,
                                                propertyService: PropertyService,
                                                securityAdvisor: CreateSecurityAdvisorService,
                                                value: any): Experiment {

        if (!value) {
            return null;
        }

        let experiment = new Experiment(dictionaryService, gnomexService, propertyService, securityAdvisor);

        experiment.cloneProperty("name", value);
        experiment.cloneProperty("number", value);
        experiment.cloneProperty("description", value);
        experiment.cloneProperty("codeProtocolType", value);
        experiment.cloneProperty("corePrepInstructions", value);
        experiment.cloneProperty("analysisInstructions", value);
        experiment.cloneProperty("captureLibDesignId", value);
        experiment.cloneProperty("avgInsertSizeFrom", value);
        experiment.cloneProperty("avgInsertSizeTo", value);
        experiment.cloneProperty("idSlideProduct", value);
        experiment.cloneProperty("protocolNumber", value);
        experiment.cloneProperty("numberOfSamples", value);
        experiment.cloneProperty("idSampleTypeDefault", value);
        experiment.cloneProperty("sampleType", value);
        experiment.cloneProperty("bioinformaticsAssist", value);
        experiment.cloneProperty("idOrganismSampleDefault", value);
        experiment.cloneProperty("isArrayINFORequest", value);
        experiment.cloneProperty("canDeleteSample", value);
        experiment.cloneProperty("canUpdateSamples", value);
        experiment.cloneProperty("isVisibleToMembers", value);
        experiment.cloneProperty("isVisibleToPublic", value);
        experiment.cloneProperty("truncatedLabName", value);
        experiment.cloneProperty("billingAccountName", value);
        experiment.cloneProperty("billingAccountNumber", value);
        experiment.cloneProperty("lastModifyDate", value);
        experiment.cloneProperty("codeRequestStatus", value);
        experiment.cloneProperty("idSampleDropOffLocation", value);
        experiment.cloneProperty("submitterEmail", value);
        experiment.cloneProperty("submitterPhone", value);
        experiment.cloneProperty("submitterInstitution", value);
        experiment.cloneProperty("isDNASeqExperiment", value);
        experiment.cloneProperty("applicationNotes", value);
        experiment.cloneProperty("coreToExtractDNA", value);
        experiment.cloneProperty("processingDate", value);
        experiment.cloneProperty("codeIsolationPrepType", value);
        experiment.cloneProperty("hasPrePooledLibraries", value);
        experiment.cloneProperty("numPrePooledTubes", value);
        experiment.cloneProperty("includeBisulfideConversion", value);
        experiment.cloneProperty("includeQubitConcentration", value);
        experiment.cloneProperty("turnAroundTime", value);
        experiment.cloneProperty("idCoreFacility", value);
        experiment.cloneProperty("idProductOrder", value);
        experiment.cloneProperty("idLab", value);
        experiment.cloneProperty("idRequest", value);
        experiment.cloneProperty("experimentOwner", value);
        experiment.cloneProperty("idAppUser", value);
        experiment.cloneProperty("idOwner", value);
        experiment.cloneProperty("createDate", value);
        experiment.cloneProperty("completedDate", value);
        experiment.cloneProperty("notes", value);
        experiment.cloneProperty("application", value);
        experiment.cloneProperty("projectName", value);
        experiment.cloneProperty("idProject", value);
        experiment.cloneProperty("project", value);
        experiment.cloneProperty("slideProduct", value);
        experiment.cloneProperty("isExternal", value);
        experiment.cloneProperty("requestStatus", value);
        experiment.cloneProperty("reagent", value);
        experiment.cloneProperty("elutionBuffer", value);
        experiment.cloneProperty("usedDnase", value);
        experiment.cloneProperty("usedRnase", value);
        experiment.cloneProperty("keepSamples", value);
        experiment.cloneProperty("seqPrepByCore", value);
        experiment.cloneProperty("adminNotes", value);
        experiment.cloneProperty("archived", value);

        experiment.codeRequestCategory = value.codeRequestCategory;

        // experiment.clonePropertyOnlyIfExists("requestCategory", value);
        experiment.cloneProperty("privacyExpirationDate", value);
        experiment.cloneProperty("targetClassIdentifier", value);
        experiment.cloneProperty("targetClassName", value);
        experiment.cloneProperty("idBillingAccount", value);
        experiment.cloneProperty("codeApplication", value);
        experiment.cloneProperty("application_object", value);
        experiment.cloneProperty("codeBioanalyzerChipType", value);
        experiment.cloneProperty("codeVisibility", value);
        experiment.cloneProperty("canUpdateVisibility", value);
        experiment.cloneProperty("isVisibleToMembersAndCollaborators", value);
        experiment.cloneProperty("idProduct", value);
        experiment.cloneProperty("canRead", value);
        experiment.cloneProperty("canUploadData", value);
        experiment.cloneProperty("canDelete", value);
        experiment.cloneProperty("ownerName", value);
        experiment.cloneProperty("idInstitution", value);
        experiment.cloneProperty("idSubmitter", value);
        experiment.cloneProperty("canUpdate", value);
        experiment.cloneProperty("submitterName", value);
        experiment.cloneProperty("labName", value);
        experiment.cloneProperty("projectDescription", value);
        experiment.cloneProperty("accountNumberDisplay", value);
        experiment.cloneProperty("idOrganism", value);
        experiment.cloneProperty("organismName", value);
        experiment.cloneProperty("otherOrganism", value);
        experiment.cloneProperty("hasCCNumber", value);
        experiment.cloneProperty("hasSampleDescription", value);
        experiment.cloneProperty("hasPlates", value);
        experiment.cloneProperty("isOpeningNewBillingTemplate", value);
        experiment.cloneProperty("isRapidMode", value);

        if (value && value.samples && Array.isArray(value.samples)) {
            experiment.samples = [];

            for (let sample of value.samples) {
                experiment.samples.push(Sample.createSampleObjectFromAny(dictionaryService, sample));
            }
        }

        experiment.cloneProperty("samples", value);

        experiment.cloneProperty("hybridizations", value);
        experiment.cloneProperty("labeledSamples", value);
        experiment.cloneProperty("analysisExperimentItems", value);
        experiment.cloneProperty("seqLibTreatments", value);
        experiment.cloneProperty("files", value);
        experiment.cloneProperty("collaborators", value);
        experiment.cloneProperty("workItems", value);
        experiment.cloneProperty("billingItems", value);
        experiment.cloneProperty("SeqLibTreatmentEntries", value);
        experiment.cloneProperty("protocols", value);
        experiment.clonePropertyOnlyIfExists("sequenceLanes", value);
        experiment.cloneProperty("PropertyEntries", value);
        experiment.cloneProperty("organism", value);
        experiment.cloneProperty("sequencingOption", value);
        experiment.cloneProperty("RequestProperties", value);
        experiment.cloneProperty("topics", value);

        experiment._PropertyEntries_original = experiment.PropertyEntries;

        return experiment;
    }

    private cloneProperty(propertyName: string, source: any) {
        if (source && source[propertyName]) {
            this[propertyName] = source[propertyName];
        }
    }

    private clonePropertyOnlyIfExists(propertyName: string, source: any) {
        if (source && this[propertyName] && source[propertyName]) {
            this[propertyName] = source[propertyName];
        }
    }

    private filterRequestProperties(): any[] {
        if (this.idCoreFacility && this.requestCategory && this.requestCategory.codeRequestCategory) {
            return this.filterPropertiesByUser(this.RequestProperties);
        } else {
            return [];
        }
    }

    public filterPropertiesByUser(propsToFilter: any[]): any[] {
        // Get property with children (organisms, platforms, appusers).
        let properties: any[] = [];

        if (propsToFilter) {
            if(!Array.isArray(propsToFilter)) {
                propsToFilter = [propsToFilter];
            }

            for (let property of propsToFilter) {
                let entry: any = this.gnomexService.getSampleProperty(property.idProperty);
                let keep: boolean = this.filterPropertyEntryWithFullProperty(entry, property);
                if (keep) {
                    keep = false;
                    let users: any[];
                    if (entry.appUsers) {
                        if (!Array.isArray(entry.appUsers)) {
                            users = [entry.appUsers.AppUserLite];
                        } else {
                            users = entry.appUsers;
                        }
                    }
                    if (!users || users.length === 0) {
                        keep = true;
                    } else {
                        let allowedUsers: any[] = this.getPermissionsList_idAppUsers();
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

        return properties;
    }

    public filterPropertyEntryWithFullProperty(property, sce): boolean {
        let keep: boolean = false;

        if (AnnotationService.isApplicableProperty(property, this.requestCategory, this.idOrganism, this.codeApplication)) {
            if (sce.isSelected === 'true' || property.isActive !== 'N') {
                keep = true;
            }
        }

        return keep;
    }

    // private getSelectedPropertyEntries
    public getSelectedSampleAnnotations(): any[] {
        return this.PropertyEntries.filter((value: any) => {
            return value.isSelected && value.isSelected === 'true';
        });
    }
    // public getUnselectedSampleAnnotations(): any[] {
    //     return this.PropertyEntries.filter((value: any) => {
    //         return value.isSelected && value.isSelected !== 'true';
    //     });
    // }

    // formerly getAnnotationAllowedUserList(): any[] { ... }
    private getPermissionsList_idAppUsers(): any[] {

        let userList: any[] = [];
        // Owner of the experiment
        Experiment.pushUnique(userList, this.idSubmitter);

        // Submitter -- if different and not null
        Experiment.pushUnique(userList, this.idAppUser);

        // Actually, it is really strange to me that like, Brian, would see a different list
        // when setting up an experiment for someone else than they themselves would see.  Not sure
        // if this really should be implemented this way.  Maybe this should be removed?
        // current user -- if different
        Experiment.pushUnique(userList, '' + this.securityAdvisor.idAppUser);

        return userList;
    }

    private static pushUnique(a: any[], v: string):void {
        if (v !== null && v !== '') {
            for (let v1 of a) {
                if (v1 === v) {
                    return;
                }
            }
            a.push(v);
        }
    }

    // Formerly refreshNewExperimentAnnotations and/or buildPropertiesByUser
    public refreshSampleAnnotationList(): void {

        this.propertyService.getPropertyList(false).subscribe((response: any[]) => {
            response = this.filterPropertiesByCore(response);
            response = this.filterPropertiesByRequestCategory(response);
            response = Experiment.filterOnlyPropertiesForSamples(response);
            response = this.filterPropertiesByUser(response);

            if (this._PropertyEntries_original && Array.isArray(this._PropertyEntries_original)) {
                let originalPropertiesThatAreSelected: any[] = this._PropertyEntries_original.filter((value) => {
                    return value.isSelected && value.isSelected === 'true';
                });

                for (let propertyEntry of response) {
                    for (let originalPropertyEntries of originalPropertiesThatAreSelected) {
                        if (propertyEntry.idProperty
                            && originalPropertyEntries.idProperty
                            && propertyEntry.idProperty === originalPropertyEntries.idProperty) {

                            propertyEntry.isSelected = originalPropertyEntries.isSelected;
                        }
                    }
                }
            }

            Experiment.addDescriptionFieldToAnnotations(response);
            this.PropertyEntries = response;
        });
    }

    public getJSONObjectRepresentation(): any {
        let tempSamples: any[] = [];

        for (let sample of this.samples) {
            tempSamples.push(sample.getJSONObjectRepresentation());
        }

        let temp: any = {
            idCoreFacility:                     this.idCoreFacility,
            idProductOrder:                     this.idProductOrder,
            idLab:                              this.idLab,
            idAppUser:                          this.idAppUser,
            targetClassIdentifier:              this.targetClassIdentifier,
            targetClassName:                    this.targetClassName,
            idBillingAccount:                   this.idBillingAccount,
            idProduct:                          this.idProduct,
            codeApplication:                    this.codeApplication,
            codeRequestCategory:                this.codeRequestCategory,
            idRequest:                          this.idRequest,
            codeBioanalyzerChipType:            this.codeBioanalyzerChipType,
            isArrayINFORequest:                 this.isArrayINFORequest,
            project:                            this.project,
            projectName:                        this.projectName,
            canRead:                            this.canRead,
            canUpdate:                          this.canUpdate,
            canDelete:                          this.canDelete,
            canUpdateVisibility:                this.canUpdateVisibility,
            canUploadData:                      this.canUploadData,
            canDeleteSample:                    this.canDeleteSample,
            canUpdateSamples:                   this.canUpdateSamples,
            codeVisibility:                     this.codeVisibility,
            isVisibleToMembers:                 this.isVisibleToMembers,
            isVisibleToMembersAndCollaborators: this.isVisibleToMembersAndCollaborators,
            isVisibleToPublic:                  this.isVisibleToPublic,
            ownerName:                          this.ownerName,
            submitterName:                      this.submitterName,
            labName:                            this.labName,
            truncatedLabName:                   this.truncatedLabName,
            billingAccountName:                 this.billingAccountName,
            billingAccountNumber:               this.billingAccountNumber,
            lastModifyDate:                     this.lastModifyDate,
            isExternal:                         this.isExternal,
            codeProtocolType:                   this.codeProtocolType,
            corePrepInstructions:               this.corePrepInstructions,
            analysisInstructions:               this.analysisInstructions,
            idSubmitter:                        this.idSubmitter,
            application:                        this.application,
            captureLibDesignId:                 this.captureLibDesignId,
            avgInsertSizeFrom:                  this.avgInsertSizeFrom,
            avgInsertSizeTo:                    this.avgInsertSizeTo,
            idProject:                          this.idProject,
            idSlideProduct:                     this.idSlideProduct,
            protocolNumber:                     this.protocolNumber,
            numberOfSamples:                    this.numberOfSamples,
            idSampleTypeDefault:                this.idSampleTypeDefault,
            notes:                              this.notes,
            bioinformaticsAssist:               this.bioinformaticsAssist,
            completedDate:                      this.completedDate,
            slideProduct:                       this.slideProduct,
            idOrganismSampleDefault:            this.idOrganismSampleDefault,
            createDate:                         this.createDate,
            idInstitution:                      this.idInstitution,
            privacyExpirationDate:              this.privacyExpirationDate,
            codeRequestStatus:                  this.codeRequestStatus,
            requestStatus:                      this.requestStatus,
            idSampleDropOffLocation:            this.idSampleDropOffLocation,
            submitterEmail:                     this.submitterEmail,
            submitterPhone:                     this.submitterPhone,
            submitterInstitution:               this.submitterInstitution,
            isDNASeqExperiment:                 this.isDNASeqExperiment,
            applicationNotes:                   this.applicationNotes,
            coreToExtractDNA:                   this.coreToExtractDNA,
            processingDate:                     this.processingDate,
            codeIsolationPrepType:              this.codeIsolationPrepType,
            hasPrePooledLibraries:              this.hasPrePooledLibraries,
            numPrePooledTubes:                  this.numPrePooledTubes,
            reagent:                            this.reagent,
            elutionBuffer:                      this.elutionBuffer,
            usedDnase:                          this.usedDnase,
            usedRnase:                          this.usedRnase,
            keepSamples:                        this.keepSamples,
            seqPrepByCore:                      this.seqPrepByCore,
            includeBisulfideConversion:         this.includeBisulfideConversion,
            includeQubitConcentration:          this.includeQubitConcentration,
            turnAroundTime:                     this.turnAroundTime,
            adminNotes:                         this.adminNotes,
            archived:                           this.archived,
            description:                        this.description,
            name:                               this.name,
            number:                             this.number,
            projectDescription:                 this.projectDescription,
            accountNumberDisplay:               this.accountNumberDisplay,
            idOrganism:                         this.idOrganism,
            organismName:                       this.organismName,
            otherOrganism:                      this.otherOrganism,
            hasCCNumber:                        this.hasCCNumber,
            hasSampleDescription:               this.hasSampleDescription,
            hasPlates:                          this.hasPlates,
            isOpeningNewBillingTemplate:        this.isOpeningNewBillingTemplate,

            analysisExperimentItems:  this.analysisExperimentItems,
            billingItems:             this.billingItems,
            collaborators:            this.collaborators,
            files:                    this.files,
            hybridizations:           this.hybridizations,
            labeledSamples:           this.labeledSamples,
            PropertyEntries:          this.PropertyEntries,
            protocols:                this.protocols,
            RequestProperties:        this.RequestProperties,
            samples:                  tempSamples,
            SeqLibTreatmentEntries:   this.SeqLibTreatmentEntries,
            seqLibTreatments:         this.seqLibTreatments,
            sequenceLanes:            this.sequenceLanes,
            workItems:                this.workItems,
            topics:                   this.topics,
        };

        return temp;
    }

    private static filterOnlyPropertiesForSamples(properties: any[]): any[] {
        if (properties && Array.isArray(properties)) {
            properties = properties.filter((value:any) => {
                return value.forSample && value.forSample === 'Y';
            });
        }
        return properties;
    }

    private filterPropertiesByCore(properties: any[]): any[] {
        if (properties && Array.isArray(properties)) {
            properties = properties.filter((value:any) => {
                return value.idCoreFacility && value.idCoreFacility === this.idCoreFacility;
            });
        }
        return properties;
    }


    private filterPropertiesByRequestCategory(properties: any[]): any[] {
        let propertyPlatformApplicationsFull: any[] = [];

        let temp: any[] = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.PROPERTY_PLATFORM_APPLICATION_DICTIONARY);

        for (let entry of temp) {
            propertyPlatformApplicationsFull.push(entry);
        }

        let propertyPlatformApplicationsFiltered: any[];

        if (propertyPlatformApplicationsFull && Array.isArray(propertyPlatformApplicationsFull)) {
            propertyPlatformApplicationsFiltered = propertyPlatformApplicationsFull.filter((a: any) => {
                return a.codeRequestCategory && a.codeRequestCategory === this.codeRequestCategory && (!a.codeApplication || a.codeApplication === this.codeApplication);
            });
        }

        if (properties && Array.isArray(properties)) {
            properties = properties.filter((value:any) => {
                for (let propertyPlatformApplication of propertyPlatformApplicationsFiltered) {
                    if (value.idProperty && value.idProperty === propertyPlatformApplication.idProperty) {
                        return true;
                    }
                }

                for (let propertyPlatformApplication of propertyPlatformApplicationsFull) {
                    // If the property isn't explicitly allowed, only filter it out if it is specified for something else.
                    // That is, an empty filter should mean no filter here.
                    if (value.idProperty && value.idProperty === propertyPlatformApplication.idProperty) {
                        return false;
                    }
                }

                return true;
            });
        }

        return properties;
    }

    private static addDescriptionFieldToAnnotations(props: any[]): void {
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
}
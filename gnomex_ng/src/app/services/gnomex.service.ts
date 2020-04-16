import {Injectable} from "@angular/core";
import {DictionaryService} from "./dictionary.service";
import {CreateSecurityAdvisorService} from "./create-security-advisor.service";
import {PropertyService} from "./property.service";
import {LabListService} from "./lab-list.service";
import {BehaviorSubject, forkJoin, Observable, Subject, Subscription, throwError} from "rxjs";
import {ProgressService} from "../home/progress.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {LaunchPropertiesService} from "./launch-properites.service";
import {Router} from "@angular/router";
import {ProjectService} from "./project.service";
import {AppUserListService} from "./app-user-list.service";
import {AuthenticationService} from "../auth/authentication.service";
import {catchError, first} from "rxjs/operators";
import {UserPreferencesService} from "./user-preferences.service";
import {DialogsService, DialogType} from "../util/popup/dialogs.service";
import {UtilService} from "./util.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {NavigationService} from "./navigation.service";

const CAN_ADMINISTER_ALL_CORE_FACILITIES: string = "canAdministerAllCoreFacilities";
const CAN_ADMINISTER_USERS: string = "canAdministerUsers";
const CORE_FACILITY_GENOMICS: string = "High Throughput Genomics";
const CORE_FACILITY_DNA_SEQ: string = "DNA Sequencing";
const CORE_FACILITY_MOLECULAR: string = "Molecular Diagnostics";
const PROPERTY_EXTERNAL_DATA_SHARING_SITE: string = "external_data_sharing_site";
const PROPERTY_USAGE_USER_VISIBILITY: string = "usage_user_visibility";
const USAGE_VISIBILITY_MASKED: string = "masked";
const USAGE_VISIBILITY_FULL: string = "full";
const TYPE_CAP_SEQ:string = "CAPSEQ";
const TYPE_MIT_SEQ:string = "MITSEQ";
const TYPE_FRAG_ANAL:string = "FRAGANAL";
const TYPE_MICROARRAY: string = 'MICROARRAY';
const PROPERTY_EXPERIMENT_SUBMISSION_DEFAULT_MODE: string = "hci.gnomex.model.Institution";

@Injectable()
export class GnomexService {
    public readonly PROPERTY_SHOW_SAMPLE_CONC_PM: string = "show_sample_conc_pm";
    public readonly PROPERTY_REQUEST_WORK_AUTH_LINK_TEXT: string = "request_work_auth_link_text";
    public readonly PROPERTY_HISEQ_RUN_TYPE_LABEL_STANDARD: string = "hiseq_run_type_label_standard";
    public readonly PROPERTY_ANALYSIS_ASSISTANCE_GROUP: string = "analysis_assistance_group";
    public readonly PROPERTY_CONTACT_EMAIL_BIOINFORMATICS: string = "contact_email_bioinformatics";
    public readonly PROPERTY_ANALYSIS_ASSISTANCE_HEADER: string = "analysis_assistance_header";
    public readonly PROPERTY_REQUEST_BIO_ANALYSIS_NOTE: string = "request_bio_analysis_note";
    public readonly PROPERTY_HIDE_SAMPLETYPE_ON_EXTERNAL_EXPERIMENT: string = "hide_sampletype_on_external_experiment";
    public readonly PROPERTY_REQUEST_PROPS_ON_CONFIRM_TAB: string = "request_props_on_confirm_tab";


    public readonly TYPE_MICROARRAY: string = "MICROARRAY";
    public readonly TYPE_NANOSTRING: string = "NANOSTRING";



    public properties: Map<string, string> = new Map<string, string>();
    public requestCategoryTypeMap: Map<string, any> = new Map<string, any>();
    public isExternalDataSharingSite: boolean = false;
    public isCoreGenomics: boolean = false;
    public showBioinformaticsLinks: boolean = true;
    public showCoreGenomicsLinks: boolean = true;
    public isUniversityUserAuthentication: boolean = false;
    public maintenanceMode: boolean = false;
    public logoOrMaint: string = 'assets/gnomex_logo_hdr.png';
    public idCoreFacilityHTG: any;
    public idCoreFacilityDNASeq: any;
    public idCoreFacilityMolecular: any;
    public managesPlateBasedWorkflow: boolean = false;
    public myCoreFacilities: any[];
    public allowExternal: boolean = false;
    public isGuestState: boolean = false;
    public showUsage: boolean = false;
    public isInternalExperimentSubmission: boolean = true;
    public uploadSampleSheetURL: string = "";
    public labList: any[] = [];
    public appUserList:any[] =[];
    public propertyList: any[] = [];
    public projectList: any[] = [];
    public submitRequestLabList: any[] = [];
    public manageLabList: any[] = [];
    public workAuthLabList: any[] = [];
    public promptedWorkAuthLabList: any[] = [];
    public faqUpdateObservable: Subject<boolean> = new Subject();
    public coreFacilitiesICanManage: any[] = [];
    public coreFacilitiesICanSubmitTo: any[] = [];
    private authSubscription: Subscription;
    private _isLoggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private appInitSubject:Subject<boolean> = new Subject();
    public faqList:any[] = []; // header uses this list is initalized when app is first loaded
    public redirectURL:string;
    /*used  app navigating to specific order item  */
    public orderInitObj:any;

    public organismList: any[] = [];
    public das2OrganismList: any[] = [];
    public activeOrganismList: any[] = [];
    public coreFacilityList: any[] = [];
    public seqLibProtocolsWithAppFilters: any[] = [];


    public disableUserSignup: boolean = false;
    public noGuestAccess: boolean = true;
    public maintenanceSplash: string;


    constructor(
        private dictionaryService: DictionaryService,
        private propertyService: PropertyService,
        private progressService: ProgressService,
        private labListService: LabListService,
        private projectService: ProjectService,
        private createSecurityAdvisorService: CreateSecurityAdvisorService,
        private authenticationService: AuthenticationService,
        private launchPropertiesService: LaunchPropertiesService,
        private appUserListService: AppUserListService,
        private http: HttpClient,
        private router: Router,
        private dialogService: DialogsService,
        private userPreferencesService: UserPreferencesService,
        private navService: NavigationService) {
    }

    /* The header only uses this for displaying itself.
        use authenticateSerivce for security decisions.
        Note this is set true when user is logged in and
        app init is completed.
    * */
    get isLoggedIn(){
        return this._isLoggedInSubject.value;
    }
    set isLoggedIn(loggedIn:boolean){
        this._isLoggedInSubject.next(loggedIn);
    }

    get isLoggedIn_BehaviorSubject(): BehaviorSubject<boolean> {
        return this._isLoggedInSubject;
    }

    /**
     * Set the internal properties array
     */
    setProperties(): void {
        for (let prop of this.dictionaryService.getEntries("hci.gnomex.model.PropertyDictionary")) {
            if (prop.value === '') {
                continue;
            }
            let qualName: string = prop.propertyName;
            if (prop.idCoreFacility) {
                qualName = prop.idCoreFacility + '\t' + qualName;
                if (prop.codeRequestCategory) {
                    qualName = prop.codeRequestCategory + '\t' + qualName;
                }
            }
            this.properties[qualName] = prop.propertyValue;
        }

    }

    public getCoreFacilityProperty(idCoreFacility: string, name: string):string {
        let result: string = "";
        if (this.properties != null) {
            let qualName: string = idCoreFacility + "\t" + name;
            result = this.properties[qualName];
            if (!result) {
                result = this.properties[name];
            }
            if (!result) {
                result = "";
            }
        }
        return result;
    }

    /**
     * get the property from the properties array.
     * @param {string} name
     * @returns {string}
     */
    getProperty(name: string): string {
        if (!this.properties) {
            return "";
        }
        return this.properties[name];
    }

    emitFaqUpdateObservable(): void {
        this.faqUpdateObservable.next();
    }

    /**
     *  Returns a promise signaling completion of setup.
     * @returns {Promise<any>}
     */
    onDictionariesLoaded(): Promise<any> {
        this.setProperties();
        this.buildMyFacilities();
        this.updateCoreFacilityForRequestCategory();
        this.setExternalDataSharingSite();

        for (let rct of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.RequestCategoryType")) {
            this.requestCategoryTypeMap.set(rct.codeRequestCategoryType, rct);
        }


        this.setIsCoreGenomics();
        //  If the user's lab only belongs to DNA Seq Core facility, we hide
        //  the bioinformatics links by default (analysis, data tracks, topics)
        //  and genomics core facility only features (workflow, amend request)
        //  We don't hide/show these links in the situation where this is
        // an external data sharing site -- the state takes care of that
        if (!this.isExternalDataSharingSite) {
            // We will show all of the links for a super admin
            if (!this.hasPermission(CAN_ADMINISTER_ALL_CORE_FACILITIES)) {
                if (!this.isCoreGenomics) {
                    this.showBioinformaticsLinks = false;
                    this.showCoreGenomicsLinks = false;
                }
            }
        }

        this.setAllowExternal();

        this.managesPlateBasedWorkflow = this.doesManagePlateBasedWorkflow();
        this.setShowUsage();
        this.setDefaultSubmissionState();
        this.buildSeqLibProtocolListWithAppFilters();
        this.propertyService.getPropertyList(false).subscribe((response: any[]) => {
            this.propertyList = response;
        }, (err: IGnomexErrorResponse) => {
        });

        this.labListService.getLabList().subscribe((response: any) => {
            this.onGetLabList(response);
        });
        this.labListService.getOrganismList().subscribe((response: any) => {
            this.onGetOrganismList(response);
        }, (err: IGnomexErrorResponse) => {
        });
        return new Promise((resolve) => {
            resolve()
        });
    }

    rebuildPropertyList() {
        this.propertyService.getPropertyList(false).subscribe((response: any[]) => {
            this.propertyList = response;
        }, (err: IGnomexErrorResponse) => {
        });
    }
    /**
     See if this person has any request categories that allow external uploads
     if not then don't show the upload external experiment menu item.
     all we need is one rc that allows external so break as soon as we find it
     */
    setAllowExternal(): void {
        if(this.myCoreFacilities) {
            for (let rc of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.RequestCategory")) {
                for (let cf2 of this.myCoreFacilities) {
                    if (rc.idCoreFacility === cf2.idCoreFacility && rc.isActive === 'Y' && rc.isExternal === 'Y') {
                        this.allowExternal = true;
                        break;
                    }
                }
                if (this.allowExternal) {
                    break;
                }
            }
        }
    }

    /**
     * Build the myCoreFacilities array
     */
    buildMyFacilities(): void {
        // Determine if there are any core facilities configured for this site
        let coreFacilities = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.CoreFacility");
        let coreGenomicsConfigured: boolean = false;
        let coreDNASeqConfigured: boolean = false;
        for (let cf of coreFacilities) {
            if (cf.isActive !== "Y") {
                continue;
            }
            if (cf.facilityName === CORE_FACILITY_GENOMICS) {
                coreGenomicsConfigured = true;
                this.idCoreFacilityHTG = cf.idCoreFacility;
            } else if (cf.facilityName === CORE_FACILITY_DNA_SEQ) {
                coreDNASeqConfigured = true;
                this.idCoreFacilityDNASeq = cf.idCoreFacility;
            } else if (cf.facilityName === CORE_FACILITY_MOLECULAR) {
                this.idCoreFacilityMolecular = cf.idCoreFacility;
            }
        }

        // Keep a list of core facilities associated with this user.  We will use
        // this to filter the request categories on the Submit Request window -- among other things.
        if (this.createSecurityAdvisorService.isGuest) {
            this.myCoreFacilities = null;
        } else if (this.hasPermission(CAN_ADMINISTER_ALL_CORE_FACILITIES)) {
            this.myCoreFacilities = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.CoreFacility");
        } else {
            this.myCoreFacilities = [];
            for (let core of this.createSecurityAdvisorService.myCoreFacilities) {

                for (let dcf of coreFacilities) {
                    if (dcf.idCoreFacility === core.idCoreFacility) {
                        let found: Boolean = false;
                        for (let i: number = 0; i < this.myCoreFacilities.length; i++) {
                            let core2 = this.myCoreFacilities[i];
                            if (core.idCoreFacility === "") {
                                found = true;
                                break;
                            } else if (core.idCoreFacility === core2.idCoreFacility) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            this.myCoreFacilities[this.myCoreFacilities.length] = dcf;
                        }
                    }
                }
            }
        }

        this.coreFacilitiesICanManage = [];
        for (let core of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.CoreFacility")) {
            for (let mCore of this.createSecurityAdvisorService.coreFacilitiesICanManage) {
                if (core.value === mCore.value) {
                    this.coreFacilitiesICanManage.push(core);
                    break;
                }
            }
        }

        this.coreFacilitiesICanSubmitTo = [];
        for (var core of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.CoreFacility")) {
            for (let sCore of this.createSecurityAdvisorService.coreFacilitiesICanSubmitTo) {
                if (sCore.value === core.value) {
                    this.coreFacilitiesICanSubmitTo.push(core);
                    break;
                }
            }
        }



        // Sort core facilities by sort order
        if (this.myCoreFacilities) {
            this.myCoreFacilities = this.myCoreFacilities.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        }

    }

    /**
     * Update the coreFacility hasRequestCategories
     */
    updateCoreFacilityForRequestCategory(): void {
        if(this.myCoreFacilities){
            for (let coreCheckReqCat of this.myCoreFacilities) {
                coreCheckReqCat.hasRequestCategories = 'N';
                for (let reqCheckReqCat of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.RequestCategory")) {
                    if (coreCheckReqCat.idCoreFacility === reqCheckReqCat.idCoreFacility) {
                        coreCheckReqCat.hasRequestCategories = 'Y';
                        break;
                    }
                }
            }
        }
    }

    /**
     * Set the isExternalDataSharingSite variable
     */
    setExternalDataSharingSite(): void {
        if (this.getProperty(PROPERTY_EXTERNAL_DATA_SHARING_SITE) &&
            this.getProperty(PROPERTY_EXTERNAL_DATA_SHARING_SITE) === 'Y') {
            this.isExternalDataSharingSite = true;
        } else {
            this.isExternalDataSharingSite = false;
        }

    }

    /**
     * Set the showUsage variable
     */
    setShowUsage(): void {
        if (this.getProperty(PROPERTY_USAGE_USER_VISIBILITY) != null &&
            this.getProperty(PROPERTY_USAGE_USER_VISIBILITY) === USAGE_VISIBILITY_MASKED ||
            this.getProperty(PROPERTY_USAGE_USER_VISIBILITY) === USAGE_VISIBILITY_FULL) {
            this.showUsage = !this.createSecurityAdvisorService.isGuest;
        } else {
            this.showUsage = this.hasPermission("canAccessAnyObject");
        }

    }

    /**
     * Set the showUsage variable
     */
    setIsCoreGenomics(): void {
        if (this.createSecurityAdvisorService.isGuest) {
            this.isCoreGenomics = true;
        } else if (this.hasPermission(CAN_ADMINISTER_ALL_CORE_FACILITIES)) {
            this.isCoreGenomics = true;
        } else {
            //TODO usesIlluminaExperimentType not working. Problem with requestCategory.type take out hack in
            // dictionary service. Seems that type is a reserved word
            if (this.usesIlluminaExperimentType() ||
                this.usesExperimentType(TYPE_MICROARRAY)) {
                this.isCoreGenomics = true;
            }
        }
    }

    /**
     * Return a boolean. True has the permission.
     * False doesnt have permission.
     * @param {string} permission
     * @returns {boolean}
     */
    public hasPermission(permission: string): boolean {
        return this.createSecurityAdvisorService.hasPermission(permission);
    }

    /**
     * Determine if the admin uses the Plate Based workflow screens (Fill Plate, Build Run, Review results)
     * @returns {boolean}
     */
    doesManagePlateBasedWorkflow(): boolean {
        if (!this.createSecurityAdvisorService.isGuest) {
            for (let cf of this.createSecurityAdvisorService.coreFacilitiesICanManage) {
                for (let requestCategory of this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY)) {
                    if (requestCategory.idCoreFacility === cf.idCoreFacility &&
                        requestCategory.isActive === "Y" &&
                        (requestCategory.type === TYPE_CAP_SEQ ||
                            requestCategory.type === TYPE_MIT_SEQ ||
                            requestCategory.type === TYPE_FRAG_ANAL)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Set the default submission state.
     */
    setDefaultSubmissionState(): void {
        if (this.propertyService.getProperty(PROPERTY_EXPERIMENT_SUBMISSION_DEFAULT_MODE) != null &&
            this.propertyService.getProperty(PROPERTY_EXPERIMENT_SUBMISSION_DEFAULT_MODE) === "INTERNAL") {
            // Default is "submit request" (internal), but if this is an external data sharing
            // hub, make default "register external" experiment.
            this.isInternalExperimentSubmission = !this.isExternalDataSharingSite;
        } else if (this.propertyService.getProperty(PROPERTY_EXPERIMENT_SUBMISSION_DEFAULT_MODE) != null &&
            this.propertyService.getProperty(PROPERTY_EXPERIMENT_SUBMISSION_DEFAULT_MODE) === "EXTERNAL") {
            this.isInternalExperimentSubmission = false;
        } else {
            this.isInternalExperimentSubmission = true;
        }
    }

    /**
     * Determine if the user uses Illumina type
     * @returns {boolean}
     */
    public usesIlluminaExperimentType(): boolean {
        if (this.createSecurityAdvisorService.isGuest) {
            return false;
        }
        if (this.hasPermission(CAN_ADMINISTER_ALL_CORE_FACILITIES)) {
            let found: boolean = false;
            for (let rc of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.RequestCategory")) {
                if (rc.isActive === "Y") {
                    let rct = this.requestCategoryTypeMap.get(rc.type);
                    if (rct && rct.isIllumina === "Y") {
                        found = true;
                        break;
                    }
                }
            }
            return found;
        }
        //TODO Is myCoreFacilities equiv. to createSecurityAdvisor.lastResult..CoreFacility
        for (let cf of this.myCoreFacilities) {
            for (let requestCategory of this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY)) {
                if (requestCategory.isActive === 'Y' && requestCategory.idCoreFacility === cf.idCoreFacility) {
                    let rct1 = this.requestCategoryTypeMap.get(requestCategory.type);
                    if (rct1 && rct1.isIllumina === 'Y') {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     *
     * @param {string} experimentType
     * @returns {boolean}
     */
    usesExperimentType(experimentType: string): boolean {
        if (this.createSecurityAdvisorService.isGuest) {
            return false;
        }
        if (this.hasPermission(CAN_ADMINISTER_ALL_CORE_FACILITIES)) {
            let found: boolean = false;
            for (let rc of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.RequestCategory")) {
                if (rc && rc.type && rc.type.toLowerCase() === experimentType.toLowerCase() &&
                    rc.isActive === 'Y') {
                    found = true;
                    break;
                }
            }
            return found;
        }
        //TODO Is myCoreFacilities equiv. to createSecurityAdvisor.lastResult..CoreFacility
        for (let cf of this.createSecurityAdvisorService.myCoreFacilities) {
            for (let requestCategory of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.RequestCategory")) {
                if (requestCategory && requestCategory.type &&
                    requestCategory.idCoreFacility === cf.idCoreFacility &&
                    requestCategory.type.toLowerCase() === experimentType.toLowerCase() &&
                    requestCategory.isActive === 'Y') {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Get the core facilities that us products.
     * @returns {any[]}
     */
    getMyCoreThatUseProducts(): any[] {
        let myCoresThatUseProducts = [];
        let myCoresCtr: number = 0;
        if(this.myCoreFacilities){
            for (let core of this.myCoreFacilities) {
                for (let pt of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.ProductType")) {
                    if (pt.idCoreFacility === core.idCoreFacility) {
                        myCoresThatUseProducts[myCoresCtr] = core;
                        break;
                    }
                }
            }
        }
        return myCoresThatUseProducts;
    }

    private onGetLabList(labs: any):void {
        let labsNonNull: any[] = labs ? (Array.isArray(labs) ? labs : [labs.Lab]) : [];
        this.labList = labsNonNull;

        this.submitRequestLabList = this.labList.filter(lab => {
            return lab.canGuestSubmit === 'Y' || lab.canSubmitRequests === 'Y';
        });
        this.manageLabList = this.labList.filter(lab => {
            return lab.canManage === 'Y';
        });


        // For submitting work auth forms online, a non-gnomex university user will
        // select from a list of all labs.  A guest user doesn't have this feature.
        // A normal gnomex user will select from a list of their labs. (Admins
        // will have a full list since they can submit a request on behalf
        // of any lab.
        if (this.createSecurityAdvisorService.isUniversityOnlyUser) {
//            this.workAuthLabList = labsNonNull;                               // tim
//            this.promptedWorkAuthLabList = labsNonNull;
        } else if (this.isGuestState) {
        } else if (this.canSubmitRequestForALab()) {
            this.workAuthLabList = this.submitRequestLabList;
            this.promptedWorkAuthLabList = this.submitRequestLabList;
        } else {
            this.workAuthLabList = labsNonNull;
            this.promptedWorkAuthLabList = labsNonNull;
        }
    }

    public onGetOrganismList(orgs: any){
        this.das2OrganismList = [];
        this.activeOrganismList = [];

        let orgList:any[] = Array.isArray(orgs) ? orgs : [orgs.Organism];

        for (let organism of orgList) {
            if (organism.das2Name !== "" && organism.bionomialName !== "" && organism.isActive === "Y") {
                this.das2OrganismList.push(organism);
            }
            if (organism.isActive === "Y") {
                this.activeOrganismList.push(organism);
            }
        }
        this.activeOrganismList = this.activeOrganismList.sort((obj1, obj2) => {
            let so1: Number = (obj1.sortOrder === "" || obj1.sortOrder == null) ? Number(999999) : new Number(obj1.sortOrder);
            let so2: Number = (obj2.sortOrder === "" || obj2.sortOrder == null) ? Number(999999) : new Number(obj2.sortOrder);

            if (so1 < so2) {
                return -1;
            } else if (so1 > so2) {
                return 1;
            } else {
                if (obj1.combinedName < obj2.combinedName) return -1;
                if (obj1.combinedName > obj2.combinedName) return 1;
                return 0;
            }
        });
    }

    public isCoreFacilityIManage(idCoreFacility:String): boolean {
        if (this.createSecurityAdvisorService.isSuperAdmin) {
            return true;
        }
        var isMyCoreFacility: boolean = false;

        for (let facility of this.createSecurityAdvisorService.coreFacilitiesICanManage) {
            if (facility.idCoreFacility === idCoreFacility) {
                isMyCoreFacility = true;
                break;
            }
        }
        return isMyCoreFacility;
    }

    public getCoreFacilityName(idCoreFacility: string):string {
        let coreFacility = this.dictionaryService.getEntry('hci.gnomex.model.CoreFacility', idCoreFacility);
        return coreFacility.facilityName;
    }

    public getQCAppCodesForCore(idCoreFacility: string): any[] {
        let rc = this.getQCRequestCategoryForCore(idCoreFacility);
        let appCodes: any[] = [];
        for (var apprc of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.RequestCategoryApplication")) {
            if (apprc.codeRequestCategory === rc.codeRequestCategory) {
                appCodes.push(apprc.codeApplication);
            }
        }
        return appCodes;
    }

    public getQCRequestCategoryForCore(idCoreFacility: string): any {
        let retObj = null;
        for (var rc of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.RequestCategory")) {
            if (rc.idCoreFacility === idCoreFacility && rc.type === 'QC') {
                retObj = rc;
                break;
            }
        }
        return retObj;
    }


    hasGroupsToManage(): boolean {
        if (this.getGroupsToManage())
            return this.getGroupsToManage().length > 0;
    }

    getGroupsToManage(): any[] {
        if (this.isGuestState || !this.createSecurityAdvisorService.groupsToManage) {
            return [];
        } else {
            return this.createSecurityAdvisorService.groupsToManage;
        }
    }

    public canSubmitRequestForALab():  boolean {
        let hasLab: boolean = false;
        for (let lab of this.labList) {
            if (lab.canSubmitRequests === 'Y') {
                hasLab = true;
                break;
            }
        }
        return hasLab;
    }

    emitIsAppInitCompelete(complete:boolean):void {
        this.appInitSubject.next(complete);
    }


    isAppInitCompleteObservable():Observable<boolean>{
        return this.appInitSubject.asObservable();
    }

    getCodeApplicationForBioanalyzerChipType(codeBioanalyzerChipType: string): string {
        let code: string = "";
        for (let ct of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.BioanalyzerChipType")) {
            if (ct.codeBioanalyzerChipType === codeBioanalyzerChipType) {
                code = ct.codeApplication;
                break;
            }
        }
        return code;
    }

    initApp(): void {
        this.authSubscription = this.authenticationService.isAuthenticated().pipe(first()).subscribe(authenticated => {
            if (authenticated) {
                this.createSecurityAdvisorService.createSecurityAdvisor().pipe(first()).subscribe(response => {
                    this.progressService.displayLoader(15);
                    this.projectService.getProjectList().subscribe((response: any) => {
                        this.projectList = response;
                    }, (err: IGnomexErrorResponse) => {
                    });
                    this.dictionaryService.load(() => {
                        this.progressService.displayLoader(30);
                        forkJoin(this.appUserListService.getFullAppUserList(), this.labListService.getLabList())
                            .pipe(first()).subscribe((response: any[]) => {
                            this.progressService.displayLoader(45);
                            this.appUserList = UtilService.getJsonArray(response[0], response[0] ? response[0].AppUser : null);
                            this.labList = response[1];
                            this.progressService.displayLoader(60);
                            this.myCoreFacilities = this.dictionaryService.coreFacilities();
                            this.progressService.displayLoader(75);
                            this.onDictionariesLoaded().then((response) => {
                                this.progressService.displayLoader(90);
                                this.launchPropertiesService.getFAQ().pipe(first()).subscribe((response: any) => {
                                    if (response != null) {
                                        if (!this.createSecurityAdvisorService.isArray(response)) {
                                            this.faqList = [response.FAQ];
                                        } else {
                                            this.faqList = response;
                                        }
                                    }
                                    this.progressService.displayLoader(95);

                                    this.launchPropertiesService.getSampleSheetUploadURL().subscribe((response: any) => {
                                        this.progressService.displayLoader(98);
                                        this.uploadSampleSheetURL = response.url;

                                        this.userPreferencesService.createUserPreferences(false).subscribe((response: any) => {
                                            this.progressService.displayLoader(100);
                                            this.emitIsAppInitCompelete(true);
                                            this.isLoggedIn = true;
                                        }, (err: IGnomexErrorResponse) => {
                                        });
                                    });
                                }, (err: IGnomexErrorResponse) => {
                                });
                            });
                        });
                    });
                }, (err: IGnomexErrorResponse) => {
                });
            }
        });

    }
    initGuestApp() {

        let params: HttpParams = new HttpParams()
            .set("idCoreFacility", null);
        this.createSecurityAdvisorService.createGuestSecurityAdvisor(params).pipe(first()).subscribe(response => {
            this.progressService.displayLoader(15);
            this.dictionaryService.load(() => {
                this.progressService.displayLoader(30);
                forkJoin(this.appUserListService.getFullAppUserList(), this.labListService.getLabList())
                    .pipe(first()).subscribe((response: any[]) => {
                    this.progressService.displayLoader(45);
                    this.appUserList = [];
                    this.labList = response[1];
                    this.progressService.displayLoader(60);
                    this.myCoreFacilities = this.dictionaryService.coreFacilities();
                    this.progressService.displayLoader(75);
                    this.onDictionariesLoaded().then((response) => {
                        this.progressService.displayLoader(90);
                        this.launchPropertiesService.getSampleSheetUploadURL().subscribe((response: any) => {
                            this.progressService.displayLoader(95);
                            this.uploadSampleSheetURL = response.url;

                            this.userPreferencesService.createUserPreferences(true).subscribe((response: any) => {
                                this.progressService.displayLoader(100);
                                this.emitIsAppInitCompelete(true);
                                this.isLoggedIn = true;
                            }, (err: IGnomexErrorResponse) => {
                            });
                        });

                    });
                });
            });
        }, (err: IGnomexErrorResponse) => {
        });

    }


    public getOrderFromNumber(params: HttpParams) : Observable<any> {
        return this.http.get("/gnomex/GetGNomExOrderFromNumberServlet.gx", {params: params})
            .pipe(catchError((err: IGnomexErrorResponse) => {
                this.router.navigateByUrl("/home");
                return throwError(err);
            }));
    }

    private buildSeqLibProtocolListWithAppFilters():void {
        for (let seq of this.dictionaryService.getEntries('hci.gnomex.model.SeqLibProtocol')) {
            if (seq != null) {
                if (seq.isActive === "N") {
                    continue;
                }
            }
            let app = this.dictionaryService.getApplicationForProtocol(seq.idSeqLibProtocol);
            if (app) {
                if (app.isActive === "N" || app.onlyForLabPrepped === "Y")
                    continue;
                seq.idCoreFacility = app.idCoreFacility;
                seq.codeApplicationType = app.codeApplicationType;
            }
            this.seqLibProtocolsWithAppFilters.push(seq);
        }
    }

    private recurseGetFiles(fileStruct : any, flattenedFiles: any[] ):void{
        Object.keys(fileStruct).forEach(objName =>{
            if(objName === 'File' || objName === 'FileDescriptor'){
                let files = Array.isArray(fileStruct.File) ? fileStruct.File : [fileStruct.File];
                for(let f of files){
                    flattenedFiles.push(f);
                }

            }else if(objName === 'Dir'){
                this.recurseGetFiles(fileStruct[objName], flattenedFiles);
            }
        });


    }

    /**
     * Will flatten File structure to get you all files in every folder
     * @params: {any}fileStruct
     * @returns {any[]}
     */
    public getFiles(fileStruct:any) :any[]{
        let flatFiles : any[] = [];
        this.recurseGetFiles(fileStruct, flatFiles);
        return flatFiles;


    }

    private recurseTargetNodeList(targetName:string,queryObj:any, targetNodeList:Array<any> ){
        let keys = Object.keys(queryObj);
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] === targetName) {
                targetNodeList.push(queryObj[keys[i]]);
                break;
            }
            else if(typeof queryObj[keys[i]] === "object" || Array.isArray(queryObj[keys[i]])) {
                this.recurseTargetNodeList(targetName, queryObj[keys[i]], targetNodeList);

            }


        }

    }
    public getTargetNodeList(targetName:string, queryObj:any):Array<any>{
        let targetNodeList:Array<any> = [];
        this.recurseTargetNodeList(targetName,queryObj, targetNodeList);
        return targetNodeList;

    }

    public navByNumber(number:string,idInstead?:boolean){
        let params: HttpParams = new HttpParams();
        //idInstead equals true means using you'll be using the id in place of the number
        // it still should have a letter in it for example for a request '12425R'

        if (number) {
            let match = number.match(/([A-Za-z]*)([0-9]+)([A-Za-z]?)/);
            let path:Array<string> = [];
            if(match) {
                if( match[3].toUpperCase() === 'R'){

                    //path = ["experiments","idProject","browsePanel","idRequest"];
                    path = ["experiments"];
                    if(!idInstead){
                        params = params.set("requestNumber", number)
                            .set("type", "requestNumber");
                        this.getOrderID(params,path);
                    }else{
                        params = params.set("requestNumber", match[2])
                            .set("type", "requestNumber")
                            .set("hasID","Y");
                        this.getOrderID(params,path);
                    }

                }else if(match[1].toUpperCase() === 'A'){

                    //path =  ["analysis","idLab","analysisPanel","idAnalysis"];
                    path = ["analysis"];
                    if(!idInstead){
                        params = params.set("analysisNumber", number)
                            .set("type", "analysisNumber")
                        this.getOrderID(params,path);
                    }else{
                        params = params.set("analysisNumber",match[2])
                            .set("type", "analysisNumber")
                            .set("hasID", "Y");
                        this.getOrderID(params,path);
                    }

                }else if(match[1].toUpperCase()=== 'DT' ){

                    //path = ["datatracks","idGenomeBuild","datatracksPanel","idDataTrack"];
                    path = ["datatracks"];

                    if(!idInstead){
                        params = params.set("dataTrackNumber",number)
                            .set("type", "dataTrackNumber");
                        this.getOrderID(params,path);
                    }else{
                        params = params.set("dataTrackNumber",match[2])
                            .set("type", "dataTrackNumber")
                            .set("hasID","Y");
                        this.getOrderID(params,path);
                    }

                }else if(match[1].toUpperCase() === 'T'){ // topic doesn't have number only ID
                    if(match[2]){
                        params = params.set("topicNumber", match[2])
                            .set("type", "topicNumber");
                    }
                    //path = [ "topics","topicsPanel", "idLab" ] ;
                    path = [ "topics"] ;
                    this.getOrderID(params,path);
                }

            }
                } else {
            this.dialogService.alert("Lookup ID is Invalid", null, DialogType.VALIDATION);
        }
    }

    submitInternalExperiment(): boolean {
        return this.isInternalExperimentSubmission;
    }


    private getOrderID(params:HttpParams,path:string[]){
        this.getOrderFromNumber(params).pipe(first()).subscribe(data =>{
            this.navService.navMode = NavigationService.URL;
            this.orderInitObj = data;
            this.orderInitObj.urlSegList = path;
            this.orderInitObj.type = params.get("type");
            let url = this.navService.makeURL(this.orderInitObj);
            this.router.navigateByUrl(url).then((resp) =>{
                this.navService.emitBrowseTreeSetupSubject();
            });
        },(err:IGnomexErrorResponse) =>{
            console.debug(err);
        });
    }

    public getSampleProperty(idProperty: string):Object {
        let property = null;
        for (let prop of this.propertyList) {
            if (prop.idProperty === idProperty) {
                if (Array.isArray(prop)) {
                    property = prop[0];
                } else {
                    property = prop;
                }
                break;
            }
        }
        return property;
    }

    public getRequestCategoryProperty(idCoreFacility: string, codeRequestCategory: string, name: string): string {
        let result: string = "";
        if (this.properties != null) {
            let qualName: string = codeRequestCategory + '\t' + idCoreFacility + "\t" + name;
            result = this.properties[qualName];
            if (!result) {
                result = this.getCoreFacilityProperty(idCoreFacility, name);
            }
        }
        return result;
    }

    public canSubmitRequests(idLab: string): boolean {
        return this.submitRequestLabList ? this.submitRequestLabList.filter((lab) => {
            return lab.idLab === idLab;
        }).length > 0 : false;
    }

    public getLoginProperties(): void {
        this.http.get("/gnomex/GetLoginProperties.gx").subscribe((response: any) => {
            if (response && response.result === "SUCCESS") {
                this.disableUserSignup = response[PropertyService.PROPERTY_DISABLE_USER_SIGNUP];
                this.noGuestAccess = response[PropertyService.PROPERTY_NO_GUEST_ACCESS];
                this.maintenanceMode = response[PropertyService.PROPERTY_MAINTENANCEMODE];
                this.maintenanceSplash = response[PropertyService.PROPERTY_MAINTENANCE_SPLASH];
                if (this.maintenanceMode) {
                    this.logoOrMaint = this.maintenanceSplash;
                }
            }
        }, (err: IGnomexErrorResponse) => {
        });
    }
    public getLoginPropertiesObservable(): Observable<any> {
        return this.http.get("/gnomex/GetLoginProperties.gx");
    }


}

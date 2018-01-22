import {Injectable} from '@angular/core'
import {DictionaryService} from "./dictionary.service";
import {CreateSecurityAdvisorService} from "./create-security-advisor.service";
import {PropertyService} from "./property.service";
import {LabListService} from "./lab-list.service";

const CAN_ADMINISTER_ALL_CORE_FACILITIES: string = "canAdministerAllCoreFacilities";
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
    public properties: Map<string, string> = new Map<string, string>();
    private requestCategoryTypeMap: Map<string, string> = new Map<string, string>();
    public isExternalDataSharingSite: boolean = false;
    public isCoreGenomics: boolean = false;
    public showBioinformaticsLinks: boolean = true;
    public showCoreGenomicsLinks: boolean = true;
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
    public submitRequestLabList: any[] = [];
    public manageLabList: any[] = [];
    public workAuthLabList: any[] = [];
    public promptedWorkAuthLabList: any[] = [];

    constructor(private dictionaryService: DictionaryService,
                private propertyService: PropertyService,
                private labListService: LabListService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService) {}

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
            this.requestCategoryTypeMap[rct.codeRequestCategoryType] = rct;
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
        this.labListService.getLabList().subscribe((response: any[]) => {
            this.onGetLabList(response);
        })
        return new Promise((resolve) => {
            resolve()
        });
    }

    /**
     See if this person has any request categories that allow external uploads
     if not then don't show the upload external experiment menu item.
     all we need is one rc that allows external so break as soon as we find it
     */
    setAllowExternal(): void {
        for (let rc of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.RequestCategory")) {
            for (let cf2 of this.myCoreFacilities)
            {
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

    /**
     * Build the myCoreFacilities array
     */
    buildMyFacilities(): void {
        // Determine if there are any core facilities configured for this site
        let coreFacilities = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.CoreFacility");
        let coreGenomicsConfigured: boolean = false;
        let coreDNASeqConfigured: boolean = false;
        for (let cf of coreFacilities) {
            if (cf.isActive != 'Y') {
                continue;
            }
            if (cf.facilityName === CORE_FACILITY_GENOMICS) {
                coreGenomicsConfigured = true;
                this.idCoreFacilityHTG = cf.idCoreFacility
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
                    if (dcf.idCoreFacility == core.idCoreFacility) {
                        let found:Boolean = false;
                        for (let i: number = 0; i < this.myCoreFacilities.length; i++) {
                            let core2 = this.myCoreFacilities[i];
                            if (core.idCoreFacility === '') {
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
        // Sort core facilities by sort order
        if (this.myCoreFacilities)
            this.myCoreFacilities = this.myCoreFacilities.sort((n1, n2) => n1.sortOrder - n2.sortOrder);

    }

    /**
     * Update the coreFacility hasRequestCategories
     */
    updateCoreFacilityForRequestCategory(): void {
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
                    if (requestCategory.idCoreFacility == cf.idCoreFacility &&
                        requestCategory.isActive == 'Y' &&
                        (requestCategory.type == TYPE_CAP_SEQ ||
                            requestCategory.type == TYPE_MIT_SEQ ||
                            requestCategory.type == TYPE_FRAG_ANAL)) {
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
            this.propertyService.getProperty(PROPERTY_EXPERIMENT_SUBMISSION_DEFAULT_MODE) == 'INTERNAL') {
            // Default is "submit request" (internal), but if this is an external data sharing
            // hub, make default "register external" experiment.
            this.isInternalExperimentSubmission = !this.isExternalDataSharingSite;
        } else if (this.propertyService.getProperty(PROPERTY_EXPERIMENT_SUBMISSION_DEFAULT_MODE) != null &&
            this.propertyService.getProperty(PROPERTY_EXPERIMENT_SUBMISSION_DEFAULT_MODE) == 'EXTERNAL') {
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
                if (rc.isActive === 'Y') {
                    let rct = this.requestCategoryTypeMap[rc.type];
                    if (rct.isIllumina == 'Y') {
                        found = true;
                        break;
                    }
                }
            }
            return found;
        }
        //TODO Is myCoreFacilities equiv. to createSecurityAdvisor.lastResult..CoreFacility
        for (let cf of this.myCoreFacilities) {
            for (let requestCategory of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.RequestCategory")) {
                if (requestCategory.isActive === 'Y' && requestCategory.idCoreFacility === cf.idCoreFacility) {
                    let rct1 = this.requestCategoryTypeMap[requestCategory.type];
                    if (rct1.isIllumina === 'Y') {
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
        for (let core of this.myCoreFacilities) {
            for (let pt of this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.ProductType")) {
                if (pt.idCoreFacility === core.idCoreFacility) {
                    myCoresThatUseProducts[myCoresCtr] = core;
                    break;
                }
            }
        }
        return myCoresThatUseProducts;
    }

    private onGetLabList(labs: any[]):void {
        this.labList = labs;

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
            this.workAuthLabList = labs;
            this.promptedWorkAuthLabList = labs;
        } else if (this.isGuestState) {
        } else if (this.canSubmitRequestForALab()) {
            this.workAuthLabList = this.submitRequestLabList;
            this.promptedWorkAuthLabList = this.submitRequestLabList;
        } else {
            this.workAuthLabList = labs;
            this.promptedWorkAuthLabList = labs;
        }
    }

    hasGroupsToManage(): boolean {
        return this.getGroupsToManage().length > 0;
    }

    getGroupsToManage(): any[] {
        if (this.isGuestState) {
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

}

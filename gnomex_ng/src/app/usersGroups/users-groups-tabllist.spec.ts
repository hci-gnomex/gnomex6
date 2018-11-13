import {TestBed, async, ComponentFixture} from '@angular/core/testing';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {
    MatTabGroup, MatTab
} from '@angular/material';
import {FormsModule, FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {Observable} from "rxjs";
import {Http, HttpModule, XHRBackend} from "@angular/http";
import {RouterTestingModule} from "@angular/router/testing";
import {ILocalStorageServiceConfig, LocalStorageService} from "angular-2-local-storage";
import {ProgressService} from "../home/progress.service";
import {DictionaryService} from "../services/dictionary.service";
import {LaunchPropertiesService} from "../services/launch-properites.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {LabListService} from "../services/lab-list.service";
import {GnomexService} from "../services/gnomex.service";
import {PropertyService} from "../services/property.service";
import {DebugElement} from "@angular/core";
import {UsersGroupsTablistComponent} from "./users-groups-tablist.component";
import {IconTextRendererComponent} from "../util/grid-renderers/icon-text-renderer.component";
import {AgGridModule} from "ag-grid-community-angular";
import {AngularSplitModule} from "angular-split";
import {AngularMaterialModule} from "../../modules/angular-material.module";
import {BillingAdminTabComponent} from "./billingAdminTab/billing-admin-tab.component";
import {MembershipTabComponent} from "./membershipTab/membership-tab.component";
import {PasswordUtilService} from "../services/password-util.service";
import {AppUserListService} from "../services/app-user-list.service";
import {DialogsService} from '../util/popup/dialogs.service';
import {GetLabService} from '../services/get-lab.service';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MockBackend} from "@angular/http/testing";
import {By} from "@angular/platform-browser";
import {
    AUTHENTICATION_DIRECT_ENDPOINT,
    AUTHENTICATION_LOGOUT_PATH,
    AUTHENTICATION_ROUTE,
    AUTHENTICATION_TOKEN_ENDPOINT, AuthenticationService
} from "../auth/authentication.service";
import {AUTHENTICATION_TOKEN_KEY} from "../auth/authentication.provider";
import {of} from "rxjs";

const MOCKDATA=[{name:'jj'},
    {name: 'dd'}
]
let localStorageServiceConfig: ILocalStorageServiceConfig = {
    prefix: "gnomex",
    storageType: "localStorage"
};

class MockDictionaryService extends DictionaryService {
    constructor() {
        console.log("in test constructor");
        var _http: Http;
        super(_http);
    }
    getEntries(className: string): any[] {
        if (className === DictionaryService.INSTITUTION) {
            return [{name: 'U of U'}];
        }

    }
}


class MockSecurityAdvisorService extends CreateSecurityAdvisorService {
    constructor() {
        super(_http, labListService, dictionaryService);
        console.log("in test constructor");
        var _http: Http;
        var labListService: LabListService;
        var dictionaryService: DictionaryService;
    }
    billingAdmin: boolean;
    admin: boolean;
    superAdmin: boolean;

    public get isBillingAdmin(): boolean {
        return this.billingAdmin;
    }

    public get isAdmin(): boolean {
        return this.admin;
    }

    public get isSuperAdmin(): boolean {
        return this.superAdmin;
    }

    public get coreFacilitiesICanManage(): any[] {
        return [{
            "value": "2",
            "description": "<P ALIGN=\"LEFT\"><B>Experiment Types:</B></P><P ALIGN=\"LEFT\">Sanger Sequencing</P><P ALIGN=\"LEFT\">Ion Torrent Sequencing</P><P ALIGN=\"LEFT\">Qiagnen Q24 Pyrosequencer</P><P ALIGN=\"LEFT\">NGS Validation by Sanger</P><P ALIGN=\"LEFT\">Custom Sequencing Projects</P><P ALIGN=\"LEFT\"></P><P ALIGN=\"LEFT\">Learn more on our website: </P><P ALIGN=\"LEFT\"><A HREF=\"http://www.cores.utah.edu/?page_id=3644\" TARGET=\"_blank\"><U>http://cores.utah.edu/dna-sequencing/</U></A></P><P ALIGN=\"LEFT\">or call 801-585-2976</P><P ALIGN=\"LEFT\">or email LabTech@cores.utah.edu</P><P ALIGN=\"LEFT\"></P><P ALIGN=\"LEFT\">To order supplies click here:</P><P ALIGN=\"LEFT\"><A HREF=\"https://resource.cores.utah.edu/\" TARGET=\"_blank\"><U>https://resource.cores.utah.edu/</U></A></P>",
            "display": "DNA Sequencing",
            "isActive": "Y",
            "contactName": "Derek Warner",
            "contactEmail": "derek.warner@cores.utah.edu",
            "contactPhone": "801-581-4736 ",
            "facilityName": "DNA Sequencing",
            "sortOrder": "3",
            "idCoreFacility": "2",
            "shortDescription": "Sanger, Ion Torrent Sequencing",
            "contactImage": "assets/derek.jpg",
            "labRoom": "",
            "labPhone": "",
            "contactRoom": "",
            "acceptOnlineWorkAuth": "Y",
            "showProjectAnnotations": "N",
            "canDelete": "N",
            "canRead": "Y",
            "canUpdate": "N",
            "datakey": "2",
            "canWrite": "N"
        }]
    }
}

class MockAppUserListService extends AppUserListService {
    getFullAppUserList(): Observable<any> {
        return of([{"displayName":"Aagaard, Christin (inactive)","qualifiedDisplayName":"Aagaard, Christin (inactive)","displayNameXMLSafe":"Aagaard, Christin (inactive)","firstLastDisplayName":"Christin Aagaard","idAppUser":"807","firstName":"Christin","lastName":"Aagaard","email":"jj@intera.com","confirmEmailGuid":"","passwordExpired":"","guidExpiration":"","shortName":"caagaard","isActive":"N","ucscUrl":"","coreFacilitiesICanSubmitTo":{"lazy":"true"},"managingCoreFacilities":{"lazy":"true"}},
            {"displayName":"Abdellaoui, Sofiene","qualifiedDisplayName":"Abdellaoui, Sofiene","displayNameXMLSafe":"Abdellaoui, Sofiene","firstLastDisplayName":"Sofiene Abdellaoui","idAppUser":"2607","firstName":"Sofiene","lastName":"Abdellaoui","email":"u1000484@utah.edu","confirmEmailGuid":"","passwordExpired":"","guidExpiration":"","shortName":"sabdellaoui","isActive":"Y","ucscUrl":"","coreFacilitiesICanSubmitTo":{"lazy":"true"},"managingCoreFacilities":{"lazy":"true"}},
            {"displayName":"Abdul-Wajid, Sarah","qualifiedDisplayName":"Abdul-Wajid, Sarah","displayNameXMLSafe":"Abdul-Wajid, Sarah","firstLastDisplayName":"Sarah Abdul-Wajid","idAppUser":"2871","firstName":"Sarah","lastName":"Abdul-Wajid","email":"saraha@genetics.utah.edu","confirmEmailGuid":"","passwordExpired":"","guidExpiration":"","shortName":"sabdul-wajid","isActive":"Y","ucscUrl":"","coreFacilitiesICanSubmitTo":{"lazy":"true"},"managingCoreFacilities":{"lazy":"true"}},
            {"displayName":"Abedi, Majid","qualifiedDisplayName":"Abedi, Majid (external user)","displayNameXMLSafe":"Abedi, Majid","firstLastDisplayName":"Majid Abedi","idAppUser":"2833","firstName":"Majid","lastName":"Abedi","email":"majid@dxterity.com","confirmEmailGuid":"","passwordExpired":"","guidExpiration":"2015-09-23 15:13:14.117","shortName":"mabedi","isActive":"Y","ucscUrl":"","coreFacilitiesICanSubmitTo":{"lazy":"true"},"managingCoreFacilities":{"lazy":"true"}},
            {"displayName":"Abedin, Shaikha","qualifiedDisplayName":"Abedin, Shaikha","displayNameXMLSafe":"Abedin, Shaikha","firstLastDisplayName":"Shaikha Abedin","idAppUser":"2899","firstName":"Shaikha","lastName":"Abedin","email":"shaikha.abedin@utah.edu","confirmEmailGuid":"","passwordExpired":"","guidExpiration":"","shortName":"sabedin","isActive":"Y","ucscUrl":"","coreFacilitiesICanSubmitTo":{"lazy":"true"},"managingCoreFacilities":{"lazy":"true"}}
    ])
    }
    getAppUser(): Observable<any> {
        let appUser = {
            AppUser: {
                "displayName": "Adey, Nils",
                "passwordExternalEntered": "XXXX",
                "qualifiedDisplayName": "Adey, Nils (external user)",
                "displayNameXMLSafe": "Adey, Nils",
                "firstLastDisplayName": "Nils Adey",
                "idAppUser": "437",
                "firstName": "Nils",
                "lastName": "Adey",
                "uNID": "",
                "email": "nils@avanscibio.com",
                "jobTitle": "",
                "userNameExternal": "nadey",
                "confirmEmailGuid": "",
                "salt": "-30b151baccdc3c2b721715cfc3e91adf7a09ffa89a515ad7c5461b802f1a73c8db0858800143c8817f3d5b90d00c328cddfd4a3ad064891d3f6c9d3d8a59f7b7",
                "isExternalUser": "Y",
                "passwordExpired": "N",
                "codeUserPermissionKind": "LAB",
                "guidExpiration": "",
                "shortName": "nadey",
                "isActive": "Y",
                "phone": "801-232-9200",
                "institute": "AvanSci Bio",
                "department": "",
                "ucscUrl": "",
                "guid": "",
                "coreFacilitiesICanSubmitTo": {"lazy": "true"},
                "collaboratingLabs": [],
                "managingCoreFacilities": {"lazy": "true"},
                "labs": {
                    "Lab": {
                        "name": "Bio, LLC, Avansci Lab",
                        "version": "35",
                        "isExternalPricing": "N",
                        "isExternalPricingCommercial": "Y",
                        "billingContactEmail": "skaufman@avanscibio.com",
                        "canGuestSubmit": "N",
                        "billingNotificationEmail": "skaufman@avanscibio.com,nils@avanscibio.com",
                        "billingContactPhone": "",
                        "workAuthSubmitEmail": "skaufman@avanscibio.com,nils@avanscibio.com",
                        "defaultIdInstitutionForLab": "",
                        "firstName": "Avansci",
                        "lastName": "Bio, LLC",
                        "isCcsgMember": "N",
                        "nameFirstLast": "Avansci Bio, LLC Lab",
                        "excludeUsage": "N",
                        "idLab": "1347",
                        "contactAddress2": "",
                        "contactAddress": "1290 W 2320 S, STE D",
                        "contactCodeState": "UT",
                        "contactCountry": "",
                        "canSubmitRequests": "N",
                        "isActive": "Y",
                        "department": "",
                        "contactName": "Shelly Kaufman",
                        "contactCity": "Salt Lake City",
                        "contactZip": "84119",
                        "contactEmail": "nils@avanscibio.com",
                        "contactPhone": "801-972-2377",
                        "isMyLab": "N",
                        "canManage": "N",
                        "members": {"lazy": "true"},
                        "internalBillingAccounts": [],
                        "pOBillingAccounts": [{
                            "accountNameAndNumber": "Manual Billing Account - 06-30-25",
                            "accountNumberDisplay": "Manual Billing Account",
                            "totalDollarAmount": "",
                            "totalDollarAmountDisplay": "",
                            "totalDollarAmountRemaining": "",
                            "totalChargesToDateDisplay": "",
                            "startDate": "2014-06-01",
                            "idBillingAccount": "5309",
                            "submitterEmail": "",
                            "isPO": "Y",
                            "isCreditCard": "N",
                            "idCoreFacility": "2",
                            "totalDollarAmountRemainingDisplay": "",
                            "shortAcct": "15959",
                            "custom1": "",
                            "custom2": "",
                            "custom3": "",
                            "zipCode": "",
                            "approverEmail": "",
                            "idApprover": "",
                            "activeAccount": "Y",
                            "submitterUID": "",
                            "approvedDate": "",
                            "idLab": "1347",
                            "createDate": "",
                            "accountNameDisplay": "Manual Billing Account",
                            "purchaseOrderForm": "",
                            "orderFormFileType": "",
                            "orderFormFileSize": "",
                            "idCreditCardCompany": "",
                            "idFundingAgency": "",
                            "expirationDateOther": "06/30/2025",
                            "expirationDate": "2025-06-30",
                            "accountNumberAccount": "",
                            "accountNumberActivity": "",
                            "accountNumberAu": "",
                            "accountNumberBus": "",
                            "accountNumberFund": "",
                            "accountNumberOrg": "",
                            "accountNumberProject": "",
                            "accountNumberYear": "",
                            "startDateOther": "06/01/2014",
                            "isActive": "Y",
                            "accountName": "Manual Billing Account",
                            "accountNumber": "",
                            "isApproved": "Y"
                        }, {
                            "accountNameAndNumber": "Manual Billing Account - 06-30-25",
                            "accountNumberDisplay": "Manual Billing Account",
                            "totalDollarAmount": "",
                            "totalDollarAmountDisplay": "",
                            "totalDollarAmountRemaining": "",
                            "totalChargesToDateDisplay": "",
                            "startDate": "2014-06-01",
                            "idBillingAccount": "5310",
                            "submitterEmail": "",
                            "isPO": "Y",
                            "isCreditCard": "N",
                            "idCoreFacility": "5",
                            "totalDollarAmountRemainingDisplay": "",
                            "shortAcct": "15959",
                            "custom1": "",
                            "custom2": "",
                            "custom3": "",
                            "zipCode": "",
                            "approverEmail": "",
                            "idApprover": "",
                            "activeAccount": "Y",
                            "submitterUID": "",
                            "approvedDate": "",
                            "idLab": "1347",
                            "createDate": "",
                            "accountNameDisplay": "Manual Billing Account",
                            "purchaseOrderForm": "",
                            "orderFormFileType": "",
                            "orderFormFileSize": "",
                            "idCreditCardCompany": "",
                            "idFundingAgency": "",
                            "expirationDateOther": "06/30/2025",
                            "expirationDate": "2025-06-30",
                            "accountNumberAccount": "",
                            "accountNumberActivity": "",
                            "accountNumberAu": "",
                            "accountNumberBus": "",
                            "accountNumberFund": "",
                            "accountNumberOrg": "",
                            "accountNumberProject": "",
                            "accountNumberYear": "",
                            "startDateOther": "06/01/2014",
                            "isActive": "Y",
                            "accountName": "Manual Billing Account",
                            "accountNumber": "",
                            "isApproved": "Y"
                        }],
                        "creditCardBillingAccounts": [],
                        "projects": {"lazy": "true"},
                        "collaborators": {"lazy": "true"},
                        "billingAccounts": [{
                            "accountNameAndNumber": "Manual Billing Account - 06-30-25",
                            "accountNumberDisplay": "Manual Billing Account",
                            "totalDollarAmount": "",
                            "totalDollarAmountDisplay": "",
                            "totalDollarAmountRemaining": "",
                            "totalChargesToDateDisplay": "",
                            "startDate": "2014-06-01",
                            "idBillingAccount": "5309",
                            "submitterEmail": "",
                            "isPO": "Y",
                            "isCreditCard": "N",
                            "idCoreFacility": "2",
                            "totalDollarAmountRemainingDisplay": "",
                            "shortAcct": "15959",
                            "custom1": "",
                            "custom2": "",
                            "custom3": "",
                            "zipCode": "",
                            "approverEmail": "",
                            "idApprover": "",
                            "activeAccount": "Y",
                            "submitterUID": "",
                            "approvedDate": "",
                            "idLab": "1347",
                            "createDate": "",
                            "accountNameDisplay": "Manual Billing Account",
                            "purchaseOrderForm": "",
                            "orderFormFileType": "",
                            "orderFormFileSize": "",
                            "idCreditCardCompany": "",
                            "idFundingAgency": "",
                            "expirationDateOther": "06/30/2025",
                            "expirationDate": "2025-06-30",
                            "accountNumberAccount": "",
                            "accountNumberActivity": "",
                            "accountNumberAu": "",
                            "accountNumberBus": "",
                            "accountNumberFund": "",
                            "accountNumberOrg": "",
                            "accountNumberProject": "",
                            "accountNumberYear": "",
                            "startDateOther": "06/01/2014",
                            "isActive": "Y",
                            "accountName": "Manual Billing Account",
                            "accountNumber": "",
                            "isApproved": "Y"
                        }, {
                            "accountNameAndNumber": "Manual Billing Account - 06-30-25",
                            "accountNumberDisplay": "Manual Billing Account",
                            "totalDollarAmount": "",
                            "totalDollarAmountDisplay": "",
                            "totalDollarAmountRemaining": "",
                            "totalChargesToDateDisplay": "",
                            "startDate": "2014-06-01",
                            "idBillingAccount": "5310",
                            "submitterEmail": "",
                            "isPO": "Y",
                            "isCreditCard": "N",
                            "idCoreFacility": "5",
                            "totalDollarAmountRemainingDisplay": "",
                            "shortAcct": "15959",
                            "custom1": "",
                            "custom2": "",
                            "custom3": "",
                            "zipCode": "",
                            "approverEmail": "",
                            "idApprover": "",
                            "activeAccount": "Y",
                            "submitterUID": "",
                            "approvedDate": "",
                            "idLab": "1347",
                            "createDate": "",
                            "accountNameDisplay": "Manual Billing Account",
                            "purchaseOrderForm": "",
                            "orderFormFileType": "",
                            "orderFormFileSize": "",
                            "idCreditCardCompany": "",
                            "idFundingAgency": "",
                            "expirationDateOther": "06/30/2025",
                            "expirationDate": "2025-06-30",
                            "accountNumberAccount": "",
                            "accountNumberActivity": "",
                            "accountNumberAu": "",
                            "accountNumberBus": "",
                            "accountNumberFund": "",
                            "accountNumberOrg": "",
                            "accountNumberProject": "",
                            "accountNumberYear": "",
                            "startDateOther": "06/01/2014",
                            "isActive": "Y",
                            "accountName": "Manual Billing Account",
                            "accountNumber": "",
                            "isApproved": "Y"
                        }],
                        "approvedBillingAccounts": [{
                            "accountNameAndNumber": "Manual Billing Account - 06-30-25",
                            "accountNumberDisplay": "Manual Billing Account",
                            "totalDollarAmount": "",
                            "totalDollarAmountDisplay": "",
                            "totalDollarAmountRemaining": "",
                            "totalChargesToDateDisplay": "",
                            "startDate": "2014-06-01",
                            "idBillingAccount": "5309",
                            "submitterEmail": "",
                            "isPO": "Y",
                            "isCreditCard": "N",
                            "idCoreFacility": "2",
                            "totalDollarAmountRemainingDisplay": "",
                            "shortAcct": "15959",
                            "custom1": "",
                            "custom2": "",
                            "custom3": "",
                            "zipCode": "",
                            "approverEmail": "",
                            "idApprover": "",
                            "activeAccount": "Y",
                            "submitterUID": "",
                            "approvedDate": "",
                            "idLab": "1347",
                            "createDate": "",
                            "accountNameDisplay": "Manual Billing Account",
                            "purchaseOrderForm": "",
                            "orderFormFileType": "",
                            "orderFormFileSize": "",
                            "idCreditCardCompany": "",
                            "idFundingAgency": "",
                            "expirationDateOther": "06/30/2025",
                            "expirationDate": "2025-06-30",
                            "accountNumberAccount": "",
                            "accountNumberActivity": "",
                            "accountNumberAu": "",
                            "accountNumberBus": "",
                            "accountNumberFund": "",
                            "accountNumberOrg": "",
                            "accountNumberProject": "",
                            "accountNumberYear": "",
                            "startDateOther": "06/01/2014",
                            "isActive": "Y",
                            "accountName": "Manual Billing Account",
                            "accountNumber": "",
                            "isApproved": "Y"
                        }, {
                            "accountNameAndNumber": "Manual Billing Account - 06-30-25",
                            "accountNumberDisplay": "Manual Billing Account",
                            "totalDollarAmount": "",
                            "totalDollarAmountDisplay": "",
                            "totalDollarAmountRemaining": "",
                            "totalChargesToDateDisplay": "",
                            "startDate": "2014-06-01",
                            "idBillingAccount": "5310",
                            "submitterEmail": "",
                            "isPO": "Y",
                            "isCreditCard": "N",
                            "idCoreFacility": "5",
                            "totalDollarAmountRemainingDisplay": "",
                            "shortAcct": "15959",
                            "custom1": "",
                            "custom2": "",
                            "custom3": "",
                            "zipCode": "",
                            "approverEmail": "",
                            "idApprover": "",
                            "activeAccount": "Y",
                            "submitterUID": "",
                            "approvedDate": "",
                            "idLab": "1347",
                            "createDate": "",
                            "accountNameDisplay": "Manual Billing Account",
                            "purchaseOrderForm": "",
                            "orderFormFileType": "",
                            "orderFormFileSize": "",
                            "idCreditCardCompany": "",
                            "idFundingAgency": "",
                            "expirationDateOther": "06/30/2025",
                            "expirationDate": "2025-06-30",
                            "accountNumberAccount": "",
                            "accountNumberActivity": "",
                            "accountNumberAu": "",
                            "accountNumberBus": "",
                            "accountNumberFund": "",
                            "accountNumberOrg": "",
                            "accountNumberProject": "",
                            "accountNumberYear": "",
                            "startDateOther": "06/01/2014",
                            "isActive": "Y",
                            "accountName": "Manual Billing Account",
                            "accountNumber": "",
                            "isApproved": "Y"
                        }],
                        "coreFacilities": {"lazy": "true"},
                        "managers": {"lazy": "true"},
                        "institutions": []
                    }
                },
                "managingLabs": []
            },
            coreFacilitiesICanSubmitTo: {"coreFacility":{"value":"1","display":"High Throughput Genomics","selected":"N","allowed":"N"}},
            managingCoreFacilities: [{"value":"14","display":"A TEST","selected":"N"},{"value":"6","display":"Bioinformatics","selected":"N"},{"value":"2","display":"DNA Sequencing","selected":"N"},{"value":"5","display":"Genomics Core","selected":"N"},{"value":"1","display":"High Throughput Genomics","selected":"N"},{"value":"3","display":"Molecular Diagnostics","selected":"N"},{"value":"9","display":"Proteomics","selected":"N"},{"value":"13","display":"Saget Dome","selected":"N"},{"value":"8","display":"Tesla","selected":"N"},{"value":"7","display":"junk facilities","selected":"N"}],
        }
        // let appUser1 = {AppUser:{"displayName":"Abdellaoui, Sofiene","qualifiedDisplayName":"Abdellaoui, Sofiene","displayNameXMLSafe":"Abdellaoui, Sofiene","firstLastDisplayName":"Sofiene Abdellaoui","idAppUser":"2607","firstName":"Sofiene","lastName":"Abdellaoui","email":"u1000484@utah.edu","confirmEmailGuid":"","passwordExpired":"","guidExpiration":"","shortName":"sabdellaoui","isActive":"Y","ucscUrl":"","coreFacilitiesICanSubmitTo":{"lazy":"true"},"managingCoreFacilities":{"lazy":"true"}},
        //                 }
            return of(appUser);
    }

}

class MockLabListService extends LabListService {
    constructor() {
        console.log("in test constructor");
        var _http: Http;
        super(_http);
    }

    getLabListWithParams(params: URLSearchParams): Observable<any> {
        return Observable.of ([{
            "name": "tesla Lab",
            "version": "11",
            "firstName": "tesla",
            "lastName": "",
            "isActive": "Y",
            "department": "",
            "contactEmail": "tesla@tt.com",
            "isMyLab": "N",
            "canManage": "Y",
            "nameFirstLast": "tesla Lab",
            "excludeUsage": "",
            "billingContactEmail": "",
            "canGuestSubmit": "N",
            "isExternalPricing": "Y",
            "isExternalPricingCommercial": "N",
            "billingNotificationEmail": "tesla@tt.com",
            "billingContactPhone": "",
            "workAuthSubmitEmail": "tesla@tt.com",
            "canSubmitRequests": "N",
            "idLab": "1549",
            "defaultIdInstitutionForLab": "",
            "display": "tesla Lab",
            "institutions": [],
            "coreFacilities": {
                "CoreFacility": {
                    "value": "8",
                    "description": "",
                    "display": "Tesla",
                    "isActive": "Y",
                    "contactName": "Elon Musk",
                    "contactEmail": "john.dewell@hci.utah.edu",
                    "contactPhone": "555-55-5555",
                    "facilityName": "Tesla",
                    "sortOrder": "",
                    "idCoreFacility": "8",
                    "shortDescription": "hello world we make electric cars",
                    "contactImage": "",
                    "labRoom": "334",
                    "labPhone": "555-55-5555",
                    "contactRoom": "12",
                    "acceptOnlineWorkAuth": "N",
                    "showProjectAnnotations": "N",
                    "canDelete": "Y",
                    "canRead": "Y",
                    "canUpdate": "Y",
                    "datakey": "8",
                    "canWrite": "N"
                }
            }
        }, {
            "name": "uBiota Lab",
            "version": "60",
            "firstName": "uBiota",
            "lastName": "",
            "isActive": "Y",
            "department": "",
            "contactEmail": "kael@ubiota.com",
            "isMyLab": "N",
            "canManage": "Y",
            "nameFirstLast": "uBiota Lab",
            "excludeUsage": "",
            "billingContactEmail": "",
            "canGuestSubmit": "N",
            "isExternalPricing": "N",
            "isExternalPricingCommercial": "Y",
            "billingNotificationEmail": "kael@ubiota.com",
            "billingContactPhone": "",
            "workAuthSubmitEmail": "kael@ubiota.com",
            "canSubmitRequests": "N",
            "idLab": "1431",
            "defaultIdInstitutionForLab": "",
            "display": "uBiota Lab",
            "institutions": [],
            "coreFacilities": {
                "CoreFacility": {
                    "value": "1",
                    "description": "<P ALIGN=\"LEFT\"><B>Experiment Types:</B></P><P ALIGN=\"LEFT\">Illumina HiSeq</P><P ALIGN=\"LEFT\">Illumina MiSeq</P><P ALIGN=\"LEFT\">Fluidigm C1 Single Cell Auto Prep System</P><P ALIGN=\"LEFT\">Agilent 2200 TapeStation</P><P ALIGN=\"LEFT\">Invitrogen Qubit </P><P ALIGN=\"LEFT\"></P><P ALIGN=\"LEFT\"><B>RNA-Seq promotion through August 2015</B></P><P ALIGN=\"LEFT\">TruSeq Stranded mRNA Sample Prep with oligo(dT) selection- -UofUtah $120/External $180  per sample</P><P ALIGN=\"LEFT\">TruSeq Stranded Total RNA Sample Prep with RiboZero - -UofUtah $160/External $240 per sample</P><P ALIGN=\"LEFT\"></P><P ALIGN=\"LEFT\"><B>SureSelect promotion through June 30, 2015</B></P><P ALIGN=\"LEFT\">SureSelect Human All Exon v5 plus UTR- -UofUtah $200/External $300 per library prep plus enrichment</P>",
                    "display": "High Throughput Genomics",
                    "isActive": "Y",
                    "contactName": "Brian Dalley",
                    "contactEmail": "brian.dalley@hci.utah.edu",
                    "contactPhone": "801-585-7192",
                    "facilityName": "High Throughput Genomics",
                    "sortOrder": "1",
                    "idCoreFacility": "1",
                    "shortDescription": "Illumina HiSeq and MiSeq, Microarrays, Bioanalyzer, Qubit",
                    "contactImage": "",
                    "labRoom": "HCI Room 3350",
                    "labPhone": "801-581-6346",
                    "contactRoom": "HCI Room 3363",
                    "acceptOnlineWorkAuth": "Y",
                    "showProjectAnnotations": "N",
                    "canDelete": "Y",
                    "canRead": "Y",
                    "canUpdate": "Y",
                    "datakey": "1",
                    "canWrite": "N"
                }
            }
        }, {
            "name": "Abbot, Patrick Lab",
            "version": "16",
            "firstName": "Patrick",
            "lastName": "Abbot",
            "isActive": "Y",
            "department": "Biological Sciences",
            "contactEmail": "patrick.abbot@vanderbilt.edu ",
            "isMyLab": "N",
            "canManage": "Y",
            "nameFirstLast": "Patrick Abbot Lab",
            "excludeUsage": "N",
            "billingContactEmail": "",
            "canGuestSubmit": "N",
            "isExternalPricing": "Y",
            "isExternalPricingCommercial": "N",
            "billingNotificationEmail": "patrick.abbot@vanderbilt.edu ",
            "billingContactPhone": "",
            "workAuthSubmitEmail": "patrick.abbot@vanderbilt.edu ",
            "canSubmitRequests": "N",
            "idLab": "240",
            "defaultIdInstitutionForLab": "",
            "display": "Patrick Abbot Lab",
            "institutions": [],
            "coreFacilities": {
                "CoreFacility": {
                    "value": "1",
                    "description": "<P ALIGN=\"LEFT\"><B>Experiment Types:</B></P><P ALIGN=\"LEFT\">Illumina HiSeq</P><P ALIGN=\"LEFT\">Illumina MiSeq</P><P ALIGN=\"LEFT\">Fluidigm C1 Single Cell Auto Prep System</P><P ALIGN=\"LEFT\">Agilent 2200 TapeStation</P><P ALIGN=\"LEFT\">Invitrogen Qubit </P><P ALIGN=\"LEFT\"></P><P ALIGN=\"LEFT\"><B>RNA-Seq promotion through August 2015</B></P><P ALIGN=\"LEFT\">TruSeq Stranded mRNA Sample Prep with oligo(dT) selection- -UofUtah $120/External $180  per sample</P><P ALIGN=\"LEFT\">TruSeq Stranded Total RNA Sample Prep with RiboZero - -UofUtah $160/External $240 per sample</P><P ALIGN=\"LEFT\"></P><P ALIGN=\"LEFT\"><B>SureSelect promotion through June 30, 2015</B></P><P ALIGN=\"LEFT\">SureSelect Human All Exon v5 plus UTR- -UofUtah $200/External $300 per library prep plus enrichment</P>",
                    "display": "High Throughput Genomics",
                    "isActive": "Y",
                    "contactName": "Brian Dalley",
                    "contactEmail": "brian.dalley@hci.utah.edu",
                    "contactPhone": "801-585-7192",
                    "facilityName": "High Throughput Genomics",
                    "sortOrder": "1",
                    "idCoreFacility": "1",
                    "shortDescription": "Illumina HiSeq and MiSeq, Microarrays, Bioanalyzer, Qubit",
                    "contactImage": "",
                    "labRoom": "HCI Room 3350",
                    "labPhone": "801-581-6346",
                    "contactRoom": "HCI Room 3363",
                    "acceptOnlineWorkAuth": "Y",
                    "showProjectAnnotations": "N",
                    "canDelete": "Y",
                    "canRead": "Y",
                    "canUpdate": "Y",
                    "datakey": "1",
                    "canWrite": "N"
                }
            }
        }]);
    }
}


describe('Users Groups', () => {

    let de: DebugElement;
    let el: HTMLElement;
    let fixture: ComponentFixture<UsersGroupsTablistComponent>;
    let element: HTMLElement;
    let comp: UsersGroupsTablistComponent;
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                UsersGroupsTablistComponent, IconTextRendererComponent, BillingAdminTabComponent, MembershipTabComponent
            ],
            imports: [
                RouterTestingModule,
                ReactiveFormsModule,
                HttpModule,
                NgbModule.forRoot(),
                AngularMaterialModule,
                AngularSplitModule,
                BrowserAnimationsModule,
                AgGridModule.withComponents([IconTextRendererComponent]),
                FormsModule
            ],
            providers: [{provide: AuthenticationService, useClass: AuthenticationService},
                {provide:LocalStorageService, useClass: LocalStorageService},
                {provide:DictionaryService, useClass: MockDictionaryService},
                {provide:LaunchPropertiesService, useClass: LaunchPropertiesService},
                {provide:CreateSecurityAdvisorService, useClass: MockSecurityAdvisorService},
                {provide:LabListService, useClass: MockLabListService},
                {provide:GnomexService, useClass: GnomexService},
                {provide:PropertyService, useClass: PropertyService},
                {provide:AppUserListService, useClass: MockAppUserListService},
                {provide:DialogsService, useClass: DialogsService},
                {provide:GetLabService, useClass: GetLabService},
                {provide:PasswordUtilService, useClass: PasswordUtilService},
                {provide: XHRBackend, useClass: MockBackend},
                {provide: AUTHENTICATION_LOGOUT_PATH, useValue: "https://localhost:8080/auth/logout"},
                {provide: AUTHENTICATION_DIRECT_ENDPOINT, useValue: "https://localhost:8080/core/api/user/user-session/active"},
                {provide: AUTHENTICATION_TOKEN_ENDPOINT, useValue: "https://localhost:8080/core/api/token"},
                {provide: AUTHENTICATION_ROUTE, useValue: "/authentication"},
                {provide: AUTHENTICATION_TOKEN_KEY, useValue: "jwt_token"},
                {provide: ProgressService, useClass: ProgressService},
                {provide: ProgressService, useClass: ProgressService},
                {provide: 'LOCAL_STORAGE_SERVICE_CONFIG', useValue: localStorageServiceConfig}]
        });

        fixture = TestBed.createComponent(UsersGroupsTablistComponent);
        element = fixture.nativeElement;
    });


    it('should find tabs of the Group', async(() => {
        let component = fixture.debugElement.componentInstance;
        component.secAdvisor.billingAdmin = false;
        component.secAdvisor.admin = true;
        component.secAdvisor.superAdmin = false;
        component.selectedIndex = 0;
        checkSelectedIndex(0, fixture);
        // select the second tab
        let tabLabel = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[1];
        tabLabel.nativeElement.click();
        fixture.detectChanges();
        let tabGroup: any;
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            tabGroup =
                fixture.debugElement.query(By.css('#groupTabGroup')).componentInstance as MatTabGroup;
            const tabs: MatTab[] = tabGroup._tabs.toArray();
            expect(getSelectedLabel(fixture).textContent).toMatch('Group');
        });

    }));

    it('should display user detail', () => {
        let component = fixture.debugElement.componentInstance;
        component.secAdvisor.billingAdmin = false;
        component.secAdvisor.admin = true;
        component.secAdvisor.superAdmin = false;
        component.selectedIndex = 0;
        fixture.detectChanges();
        expect(component.gridOptions.api).toBeTruthy();
        component.gridOptions.api.forEachNode(node=> node.rowIndex ? 0 : node.setSelected(true));
        component.onSelectionChanged();
        fixture.detectChanges();
        expect(component.userForm.controls['permissionLevel'].value).toMatch('LAB');

    });

    it('should change to groups on click', () => {
        let component = fixture.debugElement.componentInstance;
        component.secAdvisor.billingAdmin = false;
        component.secAdvisor.admin = true;
        component.secAdvisor.superAdmin = false;
        component.selectedIndex = 0;
        checkSelectedIndex(0, fixture);

        // select the second tab
        let tabLabel = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[1];
        tabLabel.nativeElement.click();
        checkSelectedIndex(1, fixture);

    });
    it('should not change to groups on click', () => {
        let component = fixture.debugElement.componentInstance;
        component.secAdvisor.billingAdmin = false;
        component.secAdvisor.admin = false;
        component.secAdvisor.superAdmin = false;
        component.selectedIndex = 0;
        checkSelectedIndex(0, fixture);

        // select the second tab
        let tabLabel = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[1];
        tabLabel.nativeElement.click();
        //should be 0 since there is only one tab.
        checkSelectedIndex(0, fixture);

    });
});


/**
 * Checks that the `selectedIndex` has been updated; checks that the label and body have their
 * respective `active` classes
 */
function checkSelectedIndex(expectedIndex: number, fixture: ComponentFixture<any>) {
    fixture.detectChanges();

    let tabComponent: MatTabGroup = fixture.debugElement
        .query(By.css('mat-tab-group')).componentInstance;
    expect(tabComponent.selectedIndex).toBe(expectedIndex);

    let tabLabelElement = fixture.debugElement
        .query(By.css(`.mat-tab-label:nth-of-type(${expectedIndex + 1})`)).nativeElement;
    expect(tabLabelElement.classList.contains('mat-tab-label-active')).toBe(true);

    let tabContentElement = fixture.debugElement
        .query(By.css(`mat-tab-body:nth-of-type(${expectedIndex + 1})`)).nativeElement;
    expect(tabContentElement.classList.contains('mat-tab-body-active')).toBe(true);
}

function getSelectedLabel(fixture: ComponentFixture<any>): HTMLElement {
    return fixture.nativeElement.querySelector('.mat-tab-label-active');
}
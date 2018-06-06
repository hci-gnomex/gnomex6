import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';
import {LabListService} from "./lab-list.service";
import {DictionaryService} from "./dictionary.service";
import {ProgressService} from "../home/progress.service";

@Injectable()
export class CreateSecurityAdvisorService {
    private groupsToManageValue: any[];
    public get groupsToManage(): any[] {
        return this.groupsToManageValue;
    }

    public set groupsToManage(value: any[]) {
        this.groupsToManageValue = value;
    }
    private result: any;
    static readonly CAN_ACCESS_ANY_OBJECT : string = "canAccessAnyObject";
    static readonly CAN_WRITE_ANY_OBJECT : string = "canWriteAnyObject";


    private idAppUserValue: number;
    public get idAppUser(): number {
        return this.idAppUserValue;
    }

    private isGuestValue: boolean;
    public get isGuest(): boolean {
        return this.isGuestValue;
    }

    private isAdminValue: boolean;
    public get isAdmin(): boolean {
        return this.isAdminValue;
    }

    private isLabManagerValue: boolean;
    public get isLabManager(): boolean {
        return this.isLabManagerValue;
    }

    private isSuperAdminValue: boolean;
    public get isSuperAdmin(): boolean {
        return this.isSuperAdminValue;
    }

    private isBillingAdminValue: boolean;
    public get isBillingAdmin(): boolean {
        return this.isBillingAdminValue;
    }

    private userNameValue: string;
    public get userName(): string {
        return this.userNameValue;
    }

    private uIDValue: string;
    public get uID(): string {
        return this.uIDValue;
    }

    private userEmailValue: string;
    public get userEmail(): string {
        return this.userEmailValue;
    }

    private loginDateTimeValue: string;
    public get loginDateTime(): string {
        return this.loginDateTimeValue;
    }

    private isUniversityOnlyUserValue: boolean;
    public get isUniversityOnlyUser(): boolean {
        return this.isUniversityOnlyUserValue;
    }

    private isUserActiveValue: boolean;
    public get isUserActive(): boolean {
        return this.isUserActiveValue;
    }

    private isExternalUserValue: boolean;
    public get isExternalUser(): boolean {
        return this.isExternalUserValue;
    }

    private versionValue: string;
    public get version(): string {
        return this.versionValue;
    }

    private allowAllCoreFacilities: boolean = false;
    private myCoreFacilitiesIds: string[];
    private coreFacilitiesICanManageIds: string[];
    private coreFacilitiesICanSubmitToIds: string[];

    public get myCoreFacilities(): any[] {
        if (this.allowAllCoreFacilities) {
            return this.dictionaryService.getEntriesExcludeBlank(DictionaryService.CORE_FACILITY);
        } else {
            return this.dictionaryService.getEntryArray(DictionaryService.CORE_FACILITY, this.myCoreFacilitiesIds);
        }
    }

    public get coreFacilitiesICanManage(): any[] {
        if (this.allowAllCoreFacilities) {
            return this.dictionaryService.getEntriesExcludeBlank(DictionaryService.CORE_FACILITY);
        } else {
            return this.dictionaryService.getEntryArray(DictionaryService.CORE_FACILITY, this.coreFacilitiesICanManageIds);
        }
    }

    public get coreFacilitiesICanSubmitTo(): any[] {
        if (this.allowAllCoreFacilities) {
            return this.dictionaryService.getEntriesExcludeBlank(DictionaryService.CORE_FACILITY);
        } else {
            return this.dictionaryService.getEntryArray(DictionaryService.CORE_FACILITY, this.coreFacilitiesICanSubmitToIds);
        }
    }

    constructor(private http: Http,
                private labListService: LabListService, private dictionaryService: DictionaryService) {
    }

    public hasPermission(permission: string): boolean {
        if (this.isGuest) {
            return false;
        }

        let index: number;
        let length: number = this.result.globalPermissions.length;
        for (index = 0; index < length; index++) {
            if (this.result.globalPermissions[index].name === permission) {
                return true;
            }
        }
        return false;
    }

    public isCoreFacilityIManage(idCoreFacility: string): boolean {
        let ids: string[] = this.extractCoreFacilityIds(this.coreFacilitiesICanManage);
        return ids.indexOf(idCoreFacility) >= 0;
    }

    public isMyCoreFacility(idCoreFacility: string): boolean {
        let ids: string[] = this.extractCoreFacilityIds(this.myCoreFacilities);
        return ids.indexOf(idCoreFacility) >= 0;
    }

    createSecurityAdvisor(): Observable<any> {
        console.log("createSecurityAdvisor new");
        return this.http.get("/gnomex/CreateSecurityAdvisor.gx", {withCredentials: true}).map((response: Response) => {
            console.log("return createSecurityAdvisor");
            if (response.status === 200) {
                this.result = response.json();

                this.idAppUserValue = Number(this.result.idAppUser);
                this.isGuestValue = this.result.isGuest == "Y";
                this.uIDValue = this.result.uID;
                this.userNameValue = this.result.userFirstName + " " + this.result.userLastName;
                this.userEmailValue = this.result.userEmail;
                this.loginDateTimeValue = this.result.loginDateTime;
                this.isUniversityOnlyUserValue = this.result.isUniversityOnlyUser == "Y";
                this.isUserActiveValue = this.result.isUserActive == "Y";
                this.isExternalUserValue = this.result.isExternalUser == "Y";
                this.versionValue = this.result.version;
                this.isSuperAdminValue = this.hasPermission("canAdministerAllCoreFacilities");
                if (this.result.groupsToManage.Lab) {
                    this.isLabManagerValue = true;
                    if (!this.isArray(this.result.groupsToManage.Lab)) {
                        this.groupsToManage = [this.result.groupsToManage.Lab];
                    } else {
                        this.groupsToManage = this.result.groupsToManage.Lab;
                    }
                } else {
                    this.groupsToManage = [];
                    this.isLabManagerValue = false;
                }

                if (this.hasPermission("canAccessAnyObject")) {
                    if (this.hasPermission("canWriteAnyObject")) {
                        this.isAdminValue = true;
                    } else {
                        this.isBillingAdminValue = true;
                    }
                } else {
                    this.isAdminValue = false;
                    this.isBillingAdminValue = false;
                }

                this.determineUsersCoreFacilities();

                return this.result;
            } else {
                throw new Error("Error");
            }
        });
    }

    createGuestSecurityAdvisor(params:URLSearchParams):Observable<any> {
        return this.http.get("/gnomex/CreateSecurityAdvisorForGuest.gx",{search:params}).map((response: Response) => {
            if (response.status === 200) {
                this.result = response.json();

                this.isGuestValue = true;
                this.idAppUserValue = Number(this.result.idAppUser);
                this.userNameValue = "guest user";
                this.loginDateTimeValue = this.result.loginDateTime;
                this.versionValue = this.result.version;
                this.isUniversityOnlyUserValue = this.result.isUniversityOnlyUser === 'Y';
                this.isExternalUserValue = false;
                this.isSuperAdminValue = false;
                this.isAdminValue = false;
                this.isBillingAdminValue = false;
                this.isLabManagerValue = false;
                this.groupsToManage = [];
                this.determineUsersCoreFacilities();

                this.result = response.json();
            }
            else {
                throw new Error("Error");
            }
        })
    }

    /*
    Determine if the object is an array
    @param what
    */
    isArray(what) {
        return Object.prototype.toString.call(what) === "[object Array]";
    };

    private determineUsersCoreFacilities(): void {
        if (this.isSuperAdmin) {
            this.allowAllCoreFacilities = true;
        } else if (!this.isGuest) {
            this.allowAllCoreFacilities = false;
            this.myCoreFacilitiesIds = this.concatUnique(
                this.extractCoreFacilityIds(this.result.coreFacilitiesForMyLab),
                this.extractCoreFacilityIds(this.result.coreFacilitiesIManage),
                this.extractCoreFacilityIds(this.result.coreFacilitiesICanSubmitTo)
            );
            this.coreFacilitiesICanManageIds = this.extractCoreFacilityIds(this.result.coreFacilitiesIManage);
            this.coreFacilitiesICanSubmitToIds = this.extractCoreFacilityIds(this.result.coreFacilitiesICanSubmitTo);
        } else {
            this.allowAllCoreFacilities = false;
            this.myCoreFacilitiesIds = [];
            this.coreFacilitiesICanManageIds = [];
            this.coreFacilitiesICanSubmitToIds = [];
        }
    }

    private extractCoreFacilityIds(coreFacilities): string[] {
        if (!coreFacilities) {
            return [];
        }
        if (Array.isArray(coreFacilities)) {
            // multiple core facilities are returned as an array of objects
            return  coreFacilities.map((coreFacility) => coreFacility.idCoreFacility);
        } else {
            // a single core facility is returned as an object with a "CoreFacility" attribute containing the object
            return [coreFacilities.CoreFacility.idCoreFacility];
        }
    }

    /**
     * Concatenates a list of arrays without adding duplicate values
     * @param arrays
     * @returns {any[]}
     */
    private concatUnique(...arrays: any[]): any[] {
        let result = [];
        for (let array of arrays) {
            for (let item of array) {
                if (result.indexOf(item) < 0) {
                    result.push(item);
                }
            }
        }
        return result;
    }

}

import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";

import {LabListService} from "./lab-list.service";
import {DictionaryService} from "./dictionary.service";
import {map} from "rxjs/operators";


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
    static readonly CAN_WRITE_DICTIONARIES: string = "canWriteDictionaries";


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

    constructor(private httpClient: HttpClient,
                private labListService: LabListService, private dictionaryService: DictionaryService) {
    }

    public hasPermission(permission: string): boolean {
        if (this.isGuest) {
            return false;
        }

        if (!this.result || !this.result.globalPermissions) {
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
        if (this.isSuperAdmin && this.coreFacilitiesICanManageIds.length === 0) {
            for (let core of this.dictionaryService.getEntriesExcludeBlank(DictionaryService.CORE_FACILITY)) {
                this.coreFacilitiesICanManageIds.push(core.value);
            }
        }

        return this.coreFacilitiesICanManageIds.includes(idCoreFacility);
    }

    public isMyCoreFacility(idCoreFacility: string): boolean {
        let ids: string[] = this.extractCoreFacilityIds(this.myCoreFacilities);
        return ids.indexOf(idCoreFacility) >= 0;
    }

    createSecurityAdvisor(): Observable<any> {
        console.log("createSecurityAdvisor new");
        return this.httpClient.get("/gnomex/CreateSecurityAdvisor.gx", {withCredentials: true}).pipe(map((response: any) => {
            console.log("return createSecurityAdvisor");
            if (response) {
                this.result = response;

                this.idAppUserValue = Number(this.result.idAppUser);
                this.isGuestValue = this.result.isGuest === "Y";
                this.uIDValue = this.result.uID;
                this.userNameValue = this.result.userFirstName + " " + this.result.userLastName;
                this.userEmailValue = this.result.userEmail;
                this.loginDateTimeValue = this.result.loginDateTime;
                this.isUniversityOnlyUserValue = this.result.isUniversityOnlyUser === "Y";
                this.isUserActiveValue = this.result.isUserActive === "Y";
                this.isExternalUserValue = this.result.isExternalUser === "Y";
                this.versionValue = this.result.version;
                this.isSuperAdminValue = this.hasPermission("canAdministerAllCoreFacilities");
                if (this.result.groupsToManage && this.result.groupsToManage.Lab) {
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
        }));
    }

    createGuestSecurityAdvisor(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/CreateSecurityAdvisorForGuest.gx", {params: params}).pipe(map((response: any) => {
            if (response) {
                this.result = response;

                this.isGuestValue = true;
                this.idAppUserValue = Number(this.result.idAppUser);
                this.uIDValue = this.result.uID;
                this.userNameValue = "guest user";
                this.userEmailValue = this.result.userEmail;
                this.loginDateTimeValue = this.result.loginDateTime;
                this.isUserActiveValue = this.result.isUserActive === "Y";
                this.versionValue = this.result.version;
                this.isUniversityOnlyUserValue = this.result.isUniversityOnlyUser === "Y";
                this.isExternalUserValue = false;
                this.isSuperAdminValue = false;
                this.isAdminValue = false;
                this.isBillingAdminValue = false;
                this.isLabManagerValue = false;
                this.groupsToManage = [];
                this.determineUsersCoreFacilities();

                return this.result;
            } else {
                throw new Error("Error");
            }
        }));
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
            this.coreFacilitiesICanManageIds = []; // Will be filled in after dictionaries load later
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

import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Injectable()
export class UserPreferencesService {

    public formatNamesFirstLast: boolean = true;
    public userDisplayField: string = "firstLastDisplayName";
    public labDisplayField: string = "nameFirstLast";

    constructor(private httpClient: HttpClient) {
    }

    public createUserPreferences(forGuest: boolean): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("forGuest", forGuest ? "Y" : "N");
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/CreateUserPreferences.gx", params.toString(), {headers: headers}).pipe(map((response: any) => {
            if (response && response.formatNamesFirstLast) {
                if (response.formatNamesFirstLast === 'N') {
                    this.formatNamesFirstLast = false;
                    this.userDisplayField = "displayName";
                    this.labDisplayField = "name";
                }
            }
            return true;
        }));
    }

    public formatUserName(firstName?: string, lastName?:string): string {
        let formattedName: string = "";
        if (this.formatNamesFirstLast) {
            if (firstName) {
                formattedName += firstName;
                if (lastName) {
                    formattedName += " ";
                }
            }
            if (lastName) {
                formattedName += lastName;
            }
        } else {
            if (lastName) {
                formattedName += lastName;
                if (firstName) {
                    formattedName += ", ";
                }
            }
            if (firstName) {
                formattedName += firstName;
            }
        }
        return formattedName;
    }

    public createDisplaySortFunction(displayField: string): (a: any, b: any) => number {
        return (a: any, b: any) => {
            if (a && b) {
                let aDisplay: string = a[displayField];
                let bDisplay: string = b[displayField];
                if (aDisplay && bDisplay) {
                    return aDisplay.localeCompare(bDisplay)
                } else if (aDisplay && !bDisplay) {
                    return 1;
                } else if (!aDisplay && bDisplay) {
                    return -1;
                } else {
                    return 0;
                }
            } else if (a && !b) {
                return 1;
            } else if (!a && b) {
                return -1;
            } else {
                return 0;
            }
        };
    }

    public createUserDisplaySortFunction(): (a: any, b: any) => number {
        return this.createDisplaySortFunction(this.userDisplayField);
    }

    public createLabDisplaySortFunction(): (a: any, b: any) => number {
        return this.createDisplaySortFunction(this.labDisplayField);
    }

    private createDisplayWithFunction(displayField: string): (value: any) => string {
        return (value: any) => {
            return value ? value[displayField] : "";
        };
    }

    public createLabDisplayWithFunction(): (value: any) => string {
        return this.createDisplayWithFunction(this.labDisplayField);
    }

}

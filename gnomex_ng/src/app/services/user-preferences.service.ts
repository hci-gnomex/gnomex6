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

}

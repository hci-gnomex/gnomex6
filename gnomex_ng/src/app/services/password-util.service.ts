import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {AbstractControl, FormGroup} from "@angular/forms";


@Injectable()
export class PasswordUtilService {
    public readonly PASSWORD_MATCH_ERROR: string = "Passwords Must Match";
    public readonly PASSWORD_COMPLEXITY_ERROR: string = "Password Does Not Meet Requirements";
    public readonly PASSWORD_COMPLEXITY_REQUIREMENTS: string = "Passwords must be 8-25 characters long, contain no spaces or slashes, and contain three or more of the following: lowercase letter, uppercase letter, digit, or symbol";

    constructor(private httpClient: HttpClient) {
    }

    public static passwordMeetsRequirements(password: string): boolean {
        if (password && password.length >= 8 && password.length <= 25) {
            let containsLowerCase: boolean = false;
            let containsUpperCase: boolean = false;
            let containsDigit: boolean = false;
            let containsWhitespace: boolean = false;
            let containsSlash: boolean = false;
            let containsOther: boolean = false;
            for (let i = 0; i < password.length; i++) {
                let single: string = password.charAt(i);
                if (/[a-z]/.test(single)) {
                    containsLowerCase = true;
                } else if (/[A-Z]/.test(single)) {
                    containsUpperCase = true;
                } else if (/[0-9]/.test(single)) {
                    containsDigit = true;
                } else if (/\s/.test(single)) {
                    containsWhitespace = true;
                } else if (/[\/\\]/.test(single)) {
                    containsSlash = true;
                } else {
                    containsOther = true;
                }
            }
            if (containsWhitespace || containsSlash) {
                return false;
            }
            let varietyCount: number = 0;
            varietyCount += containsLowerCase ? 1 : 0;
            varietyCount += containsUpperCase ? 1 : 0;
            varietyCount += containsDigit ? 1 : 0;
            varietyCount += containsOther ? 1 : 0;
            return (varietyCount >= 3);
        } else {
            return false;
        }
    }

    public static validatePassword(c: AbstractControl): {[key: string]: any} | null {
        return PasswordUtilService.passwordMeetsRequirements(c.value) ? null : {"validatePassword": {value: c.value}};
    }

    public static validatePasswordConfirm(passwordKey?: string) {
        return (c: AbstractControl): {[key: string]: any} | null => {
            if (c.parent) {
                let parent: FormGroup = c.parent as FormGroup;
                let passwordName = passwordKey ? passwordKey : "password";
                if (c.value !== "" && c.value === parent.controls[passwordName].value) {
                    return null;
                }
            }
            return {"validatePasswordConfirm": {value: c.value}};

        };

    }

    public resetPassword(checkByUsername: boolean, value: string): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("action", "requestPasswordReset")
            .set(checkByUsername ? "userName" : "email", value);
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/ChangePassword.gx", params.toString(), {headers: headers});
    }

    public changePassword(username: string, newPassword: string, newPasswordConfirm: string, guid: string): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("action", "finalizePasswordReset")
            .set("userName", username)
            .set("newPassword", newPassword)
            .set("newPasswordConfirm", newPasswordConfirm)
            .set("guid", guid);
        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/ChangePassword.gx", params.toString(), {headers: headers});
    }
}

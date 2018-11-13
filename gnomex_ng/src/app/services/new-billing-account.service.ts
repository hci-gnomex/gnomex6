import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Subject} from "rxjs";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Injectable() export class NewBillingAccountService {

	constructor(private _http: Http) { }

	submitWorkAuthForm_chartfield(parameters: URLSearchParams): Observable<any> {
		return this._http.get("/gnomex/SubmitWorkAuthForm.gx", {withCredentials: true, search: parameters}).pipe(map((response) => {
			if (response.status === 200) {
				return response.json();
			} else {
				throw new Error("Error");
			}
		}));
	}
}
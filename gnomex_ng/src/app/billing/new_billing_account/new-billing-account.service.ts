import {Injectable} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";

@Injectable() export class NewBillingAccountService {

	constructor(private _http: Http) { }

	submitWorkAuthForm_chartfield(parameters: URLSearchParams): Observable<any> {
		return this._http.get("/gnomex/SubmitWorkAuthForm.gx", {withCredentials: true, search: parameters}).map((response) => {
			if (response.status === 200) {
				return response.json();
			} else {
				throw new Error("Error");
			}
		});
	}

}
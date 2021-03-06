import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";

@Injectable() export class NewBillingAccountService {

	constructor(private httpClient: HttpClient) { }

	public submitWorkAuthForm_chartfield(params: HttpParams): Observable<any> {
		return this.httpClient.get("/gnomex/SubmitWorkAuthForm.gx", { withCredentials: true, params: params });
	}
}
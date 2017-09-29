import {Inject, Injectable, OpaqueToken} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";

@Injectable()
export class EmailRelatedUsersService {

	private emailSentSuccess:boolean;
	private emailSentSubject:Subject<boolean> = new Subject();

	constructor(private _http:Http) {	}

	getEmailSentSubscription(): Observable<boolean> {
		return this.emailSentSubject.asObservable();
	}

	sendEmailToRequestRelatedUsers(idRequests:number[], subject:string, body:string) {
		let parameters:URLSearchParams = new URLSearchParams();
		let xmlString:string = "";

		xmlString += "<Requests>";

		for(let idRequest in idRequests) {
			xmlString += "<idRequest>" + idRequests[idRequest] + "</idRequest>";
		}

		xmlString += "</Requests>";

		parameters.set("requestsXMLString", xmlString);
		parameters.set("subject", subject);
		parameters.set("body", body);

		// send the request to the backend.

		this._http.get("/gnomex/EmailServlet.gx", {
			withCredentials: true,
			search: parameters
		}).subscribe((response: Response) => {
			console.log("EmailServlet called");

			if (response.status === 200) {
				this.emailSentSuccess = true;
				this.emitEmailToRequestRelatedUsersResults();
			} else {
				this.emailSentSuccess = false;
				this.emitEmailToRequestRelatedUsersResults();
				throw new Error("Error");
			}
		});
	}

	private emitEmailToRequestRelatedUsersResults() {
		this.emailSentSubject.next(this.emailSentSuccess);
		this.emailSentSuccess = false;
	}
}

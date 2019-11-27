import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable, Subject} from "rxjs";
import {IGnomexErrorResponse} from "../interfaces/gnomex-error.response.model";
import {DialogsService} from "../popup/dialogs.service";


@Injectable()
export class EmailRelatedUsersService {

	private emailSentSuccess: boolean;
	private emailSentSubject: Subject<boolean> = new Subject();

	constructor(private httpClient: HttpClient,
				private dialogService: DialogsService) {	}

	getEmailSentSubscription(): Observable<boolean> {
		return this.emailSentSubject.asObservable();
	}

	sendEmailToRequestRelatedUsers(idRequests: number[], subject: string, body: string) {
		let params: HttpParams = new HttpParams();
		let xmlString: string = "";

		xmlString += "<Requests>";

		for(let idRequest in idRequests) {
			xmlString += "<idRequest>" + idRequests[idRequest] + "</idRequest>";
		}

		xmlString += "</Requests>";

		params = params.set("requestsXMLString", xmlString);
		params = params.set("subject", subject);
		params = params.set("body", body);

		// send the request to the backend.

		this.httpClient.get("/gnomex/EmailServlet.gx", {
			withCredentials: true,
			params: params,
		}).subscribe((response: any) => {
			this.emailSentSuccess = true;
			this.emitEmailToRequestRelatedUsersResults();

		}, (err: IGnomexErrorResponse) => {
			this.emailSentSuccess = false;
			this.emitEmailToRequestRelatedUsersResults();
		});
	}

	private emitEmailToRequestRelatedUsersResults() {
		this.emailSentSubject.next(this.emailSentSuccess);
		this.emailSentSuccess = false;
	}
}

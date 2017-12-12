import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";

@Injectable() export class AccountFieldsConfigurationService {

	private internalAccountFieldsConfigurationSubject: Subject<any> = new Subject();
	private otherAccountFieldsConfigurationSubject: Subject<any> = new Subject();

	private internalAccountFieldsConfiguration: any = null;
	private otherAccountFieldsConfiguration: any = null;

	constructor(private _http: Http) { }


	getInternalAccountFieldsConfigurationObservable(): Observable<any> {
		return this.internalAccountFieldsConfigurationSubject.asObservable();
	}

	publishInternalAccountFieldsConfiguration(): void {
		if (this.internalAccountFieldsConfiguration != null) {
			this.internalAccountFieldsConfigurationSubject.next(this.internalAccountFieldsConfiguration);
		} else {
			this._http.get("/gnomex/GetAccountFieldsConfiguration.gx").map((response: Response) => {
				if (response.status === 200) {
					this.internalAccountFieldsConfiguration = response.json();
					this.internalAccountFieldsConfigurationSubject.next(response.json());
				} else {
					throw new Error("Error");
				}
			});
		}
	}

	getOtherAccountFieldsConfigurationObservable(): Observable<any> {
		return this.otherAccountFieldsConfigurationSubject.asObservable();
	}
}
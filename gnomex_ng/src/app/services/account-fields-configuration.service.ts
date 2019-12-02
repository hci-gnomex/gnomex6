import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Subject} from "rxjs";
import {Observable} from "rxjs";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

@Injectable() export class AccountFieldsConfigurationService {

	private internalAccountFieldsConfigurationSubject: Subject<any> = new Subject();
	private otherAccountFieldsConfigurationSubject: Subject<any> = new Subject();

	private internalAccountFieldsConfiguration: any[] = null;
	private otherAccountFieldsConfiguration: any[] = null;


	constructor(private httpClient: HttpClient) { }


	getInternalAccountFieldsConfigurationObservable(): Observable<any> {
		return this.internalAccountFieldsConfigurationSubject.asObservable();
	}

	getOtherAccountFieldsConfigurationObservable(): Observable<any> {
		return this.otherAccountFieldsConfigurationSubject.asObservable();
	}

	publishAccountFieldConfigurations(): void {
		if (this.internalAccountFieldsConfiguration && this.otherAccountFieldsConfiguration) {
			this.internalAccountFieldsConfigurationSubject.next(this.internalAccountFieldsConfiguration);
			this.otherAccountFieldsConfigurationSubject.next(this.otherAccountFieldsConfiguration);
		} else {
			this.httpClient.get("/gnomex/GetAccountFieldsConfiguration.gx").subscribe((response: any) => {
				if(response && response.InternalAccountFieldsConfigurationList) {
					this.internalAccountFieldsConfiguration = response.InternalAccountFieldsConfigurationList;
					this.internalAccountFieldsConfigurationSubject.next(this.internalAccountFieldsConfiguration);
				}
				if(response && response.OtherAccountFieldsConfigurationList) {
					this.otherAccountFieldsConfiguration = response.OtherAccountFieldsConfigurationList;
					this.otherAccountFieldsConfigurationSubject.next(this.otherAccountFieldsConfiguration);
				}
			}, (err: IGnomexErrorResponse) => {
			});
		}
	}
}

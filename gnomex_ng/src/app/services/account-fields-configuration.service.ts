import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";

@Injectable() export class AccountFieldsConfigurationService {

	private internalAccountFieldsConfigurationSubject: Subject<any> = new Subject();
	private otherAccountFieldsConfigurationSubject: Subject<any> = new Subject();

	private internalAccountFieldsConfiguration: any[] = null;
	private otherAccountFieldsConfiguration: any[] = null;

	private spoofedInternalData: any[] = [
		{
			"displayName": "Project Name",
			"fieldName": "project",
			"idInternalAccountFieldsConfiguration": "6",
			"include": "Y",
			"isNumber": "Y",
			"minLength": "3",
			"maxLength": "5",
			"isRequired": "Y",
			"sortOrder": "0"
		},
		{
			"displayName": "Account Name",
			"fieldName": "account",
			"idInternalAccountFieldsConfiguration": "7",
			"include": "Y",
			"isNumber": "Y",
			"minLength": "4",
			"maxLength": "5",
			"isRequired": "Y",
			"sortOrder": "1"
		},
		{
			"displayName": "Custom Field 1",
			"fieldName": "custom1",
			"idInternalAccountFieldsConfiguration": "8",
			"include": "Y",
			"isNumber": "Y",
			"minLength": "5",
			"maxLength": "5",
			"isRequired": "Y",
			"sortOrder": "2"
		},
		{
			"displayName": "Custom Field 2",
			"fieldName": "custom2",
			"idInternalAccountFieldsConfiguration": "9",
			"include": "Y",
			"isNumber": "Y",
			"minLength": "6",
			"maxLength": "7",
			"isRequired": "Y",
			"sortOrder": "3"
		},
		{
			"displayName": "Custom Field 3",
			"fieldName": "custom3",
			"idInternalAccountFieldsConfiguration": "10",
			"include": "Y",
			"isNumber": "Y",
			"minLength": "7",
			"maxLength": "7",
			"isRequired": "Y",
			"sortOrder": "4"
		}
	];

	private spoofedData: any[] = [
		{
			"fieldName": "shortAcct",
			"include": "Y",
			"idOtherAccountFieldsConfiguration": "",
			"isRequired": "Y"
		},
		{
			"fieldName": "startDate",
			"include": "Y",
			"idOtherAccountFieldsConfiguration": "",
			"isRequired": "Y"
		},
		{
			"fieldName": "expirationDate",
			"include": "Y",
			"idOtherAccountFieldsConfiguration": "",
			"isRequired": "Y"
		},
		{
			"fieldName": "idFundingAgency",
			"include": "Y",
			"idOtherAccountFieldsConfiguration": "",
			"isRequired": "Y"
		},
		{
			"fieldName": "totalDollarAmount",
			"include": "Y",
			"idOtherAccountFieldsConfiguration": "",
			"isRequired": "Y"
		}
	];


	constructor(private _http: Http) { }


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
			this._http.get('GetAccountFieldsConfiguration.gx').subscribe((response) => {
				if (response.status === 200) {
					this.internalAccountFieldsConfiguration = response.json().InternalAccountFieldsConfigurationList;
					this.otherAccountFieldsConfiguration    = response.json().OtherAccountFieldsConfigurationList;
					// this.internalAccountFieldsConfiguration = this.spoofedInternalData;
					// this.otherAccountFieldsConfiguration    = this.spoofedData;

					this.internalAccountFieldsConfigurationSubject.next(this.internalAccountFieldsConfiguration);
					this.otherAccountFieldsConfigurationSubject.next(this.otherAccountFieldsConfiguration);
				} else {
					throw new Error("Error");
				}
			});
		}
	}
}
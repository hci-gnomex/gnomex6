import {Injectable} from "@angular/core";

@Injectable() export class CoreFacilityListPerLabService {
	private localdata: any[] = [
		{name: "Testing 1,2,3 Testing"}
	];
	private source: any = {
		datatype: "json",
		localdata: this.localdata,
		datafields: [
			{name: "name", type: "string"}
		]
	}


}
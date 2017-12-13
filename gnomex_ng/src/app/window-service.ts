import {Injectable} from "@angular/core";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";

@Injectable() export class WindowService {

	private newBillingAccountWindowOpenSubject: Subject<any> = new Subject<any>();

	constructor() { }

	getNewBillingAccountWindowOpenObservable(): Observable<any> {
		return this.newBillingAccountWindowOpenSubject.asObservable();
	}

	openNewBillingAccountWindow(): void {
		this.newBillingAccountWindowOpenSubject.next({message: 'open'});
	}

}
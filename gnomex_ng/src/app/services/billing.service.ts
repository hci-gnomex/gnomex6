import {EventEmitter, Injectable, Output} from "@angular/core";
import {Http, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';
import {HttpClient, HttpParams} from "@angular/common/http";
import {CookieUtilService} from "./cookie-util.service";
import {BillingTemplate} from "../util/billing-template-window.component";
import {BillingViewChangeForCoreCommentsWindowEvent} from "../billing/billing-view-change-for-core-comments-window-event.model";
import {BillingFilterEvent} from "../billing/billing-filter.component";

@Injectable()
export class BillingService {

    private lastBillingViewChangeForCoreCommentsWindowEvent: BillingViewChangeForCoreCommentsWindowEvent;
    public billingViewChangeForCoreCommentsWindow: EventEmitter<BillingViewChangeForCoreCommentsWindowEvent> = new EventEmitter<BillingViewChangeForCoreCommentsWindowEvent>();
    public requestSelectedFromCoreCommentsWindow: EventEmitter<string> = new EventEmitter<string>();
    public refreshBillingScreenRequest: EventEmitter<any> = new EventEmitter<any>();

    constructor(private http: Http,
                private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService) {
    }

    getBillingRequestListDep(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetBillingRequestList.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    getBillingItemListDep(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetBillingItemList.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    getBillingInvoiceListDep(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetBillingInvoiceList.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    getBillingAccountListForPeriodAndCore(params: URLSearchParams): Observable<any> {
        return this.http.get("/gnomex/GetBillingAccountListForPeriodAndCore.gx", {search: params}).map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Error");
            }
        });
    }

    public getLibPrepApplicationPriceList(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetLibPrepApplicationPriceList.gx", {params: params});
    }

    public getAuthorizedBillingAccounts(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetAuthorizedBillingAccounts.gx", {params: params});
    }

    public getBillingRequestList(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetBillingRequestList.gx", {params: params});
    }

    public createBillingItems(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/CreateBillingItems.gx", {params: params});
    }

    createBillingItems2(formData: string):Observable<any>{
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/CreateBillingItems.gx", formData.toString());
    }

    public getBillingItemList(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetBillingItemList.gx", {params: params});
    }

    public getBillingInvoiceList(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetBillingInvoiceList.gx", {params: params});
    }

    public getHiSeqRunTypePriceList(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetHiSeqRunTypePriceList.gx", {params: params});
    }

    public saveBillingItemList(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/SaveBillingItemList.gx", null, {params: params});
    }

    public getBillingTemplate(targetClassIdentifier: string, targetClassName: string): Observable<BillingTemplate> {
        let params: HttpParams = new HttpParams()
            .set("targetClassIdentifier", targetClassIdentifier)
            .set("targetClassName", targetClassName);

        return this.httpClient.get("/gnomex/GetBillingTemplate.gx", {params: params}).map((result: any) => {
            if (result && result.idBillingTemplate) {
                let billingTemplateItems: any[] = Array.isArray(result.BillingTemplateItem) ? result.BillingTemplateItem : [result.BillingTemplateItem];
                let totalPercentAccounted: number = 0;
                for (let i of billingTemplateItems) {
                    i.percentSplit = Number.parseFloat(i.percentSplit);
                    i.acceptBalance = i.acceptBalance === "true" || i.acceptBalance === "Y" ? "Y" : "N";
                    if (i.acceptBalance === "N") {
                        totalPercentAccounted += i.percentSplit;
                    }
                }
                for (let i of billingTemplateItems) {
                    if (i.acceptBalance === "Y") {
                        i.percentSplit = 100 - totalPercentAccounted;
                    }
                }
                result.items = billingTemplateItems;

                return (result as BillingTemplate);
            } else {
                return null;
            }
        });
    }

    public saveBillingTemplate(template: BillingTemplate): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("billingTemplateJSONString", JSON.stringify(template))
            .set("noJSONToXMLConversionNeeded", "Y");
        return this.httpClient.get("/gnomex/SaveBillingTemplate.gx", {params: params});
    }

    public getPricingList(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetPricingList.gx", {params: params});
    }

    public deletePriceSheet(idPriceSheet: string): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        let params: HttpParams = new HttpParams()
            .set("idPriceSheet", idPriceSheet);
        return this.httpClient.post("/gnomex/DeletePriceSheet.gx", null, {params: params});
    }

    public deletePriceCategory(idPriceCategory: string, idPriceSheet: string): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        let params: HttpParams = new HttpParams()
            .set("idPriceCategory", idPriceCategory)
            .set("idPriceSheet", idPriceSheet);
        return this.httpClient.post("/gnomex/DeletePriceCategory.gx", null, {params: params});
    }

    public deletePrice(idPrice: string): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        let params: HttpParams = new HttpParams()
            .set("idPrice", idPrice);
        return this.httpClient.post("/gnomex/DeletePrice.gx", null, {params: params});
    }

    public movePriceCategory(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/MovePriceCategory.gx", null, {params: params});
    }

    public getPriceSheet(idPriceSheet: string): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("idPriceSheet", idPriceSheet);
        return this.httpClient.get("/gnomex/GetPriceSheet.gx", {params: params});
    }

    public savePriceSheet(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/SavePriceSheet.gx", null, {params: params});
    }

    public getPriceCategory(idPriceCategory: string): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("idPriceCategory", idPriceCategory);
        return this.httpClient.get("/gnomex/GetPriceCategory.gx", {params: params});
    }

    public savePriceCategory(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/SavePriceCategory.gx", null, {params: params});
    }

    public getPrice(idPrice: string): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("idPrice", idPrice);
        return this.httpClient.get("/gnomex/GetPrice.gx", {params: params});
    }

    public savePrice(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/SavePrice.gx", null, {params: params});
    }

    public sendBillingInvoiceEmail(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/SendBillingInvoiceEmail.gx", null, {params: params});
    }

    public broadcastBillingViewChangeForCoreCommentsWindow(billingFilterEvent: BillingFilterEvent = null, showOtherBillingItems: boolean = null, excludeNewRequests: boolean = null): void {
        let event: BillingViewChangeForCoreCommentsWindowEvent = this.lastBillingViewChangeForCoreCommentsWindowEvent ? this.lastBillingViewChangeForCoreCommentsWindowEvent : new BillingViewChangeForCoreCommentsWindowEvent();
        if (billingFilterEvent != null) {
            event.idLab = billingFilterEvent.idLab;
            event.requestNumber = billingFilterEvent.requestNumber;
            event.idBillingPeriod = billingFilterEvent.idBillingPeriod;
            event.idCoreFacility = billingFilterEvent.idCoreFacility;
            event.invoiceLookupNumber = billingFilterEvent.invoiceNumber;
            event.idBillingAccount = billingFilterEvent.idBillingAccount;
        }
        if (showOtherBillingItems != null) {
            event.showOtherBillingItems = showOtherBillingItems;
        }
        if (excludeNewRequests != null) {
            event.excludeNewRequests = excludeNewRequests;
        }
        this.lastBillingViewChangeForCoreCommentsWindowEvent = event;
        this.billingViewChangeForCoreCommentsWindow.emit(event);
    }

    public broadcastRequestSelectedFromCoreCommentsWindow(requestNumber: string): void {
        this.requestSelectedFromCoreCommentsWindow.emit(requestNumber);
    }

    public getCoreCommentsForBillingPeriod(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetCoreCommentsForBillingPeriod.gx", {params: params});
    }

    public requestBillingScreenRefresh(): void {
        this.refreshBillingScreenRequest.emit();
    }

}

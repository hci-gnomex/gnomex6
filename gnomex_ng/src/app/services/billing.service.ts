import {EventEmitter, Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {CookieUtilService} from "./cookie-util.service";
import {BillingTemplate} from "../util/billing-template-window.component";
import {BillingViewChangeForCoreCommentsWindowEvent} from "../billing/billing-view-change-for-core-comments-window-event.model";
import {BillingFilterEvent} from "../billing/billing-filter.component";
import {map} from "rxjs/operators";
import {UtilService} from "./util.service";
import {Experiment} from "../util/models/experiment.model";

@Injectable()
export class BillingService {

    public billingViewChangeForCoreCommentsWindow: EventEmitter<BillingViewChangeForCoreCommentsWindowEvent> = new EventEmitter<BillingViewChangeForCoreCommentsWindowEvent>();
    public requestSelectedFromCoreCommentsWindow: EventEmitter<string> = new EventEmitter<string>();
    public refreshBillingScreenRequest: EventEmitter<any> = new EventEmitter<any>();
    private lastBillingViewChangeForCoreCommentsWindowEvent: BillingViewChangeForCoreCommentsWindowEvent;

    constructor(private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService) {
    }

    getBillingAccountListForPeriodAndCore(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetBillingAccountListForPeriodAndCore.gx", {params: params});
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

    public createBillingItems(experimentAnnotations: string, experiment: Experiment): Observable<any> {

        let stringifiedRequest: string = JSON.stringify(experiment.getJSONObjectRepresentation());

        let params: HttpParams = new HttpParams()
            .set("propertiesXML", experimentAnnotations)
            .set("requestXMLString", stringifiedRequest)
            .set("noJSONToXMLConversionNeeded", "Y");

        this.cookieUtilService.formatXSRFCookie();

        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");
        return this.httpClient.post("/gnomex/CreateBillingItems.gx", params.toString(), { headers: headers });
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

        let headers: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/x-www-form-urlencoded");

        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/SaveBillingItemList.gx", params.toString(), { headers: headers});
    }

    public getBillingTemplate(targetClassIdentifier: string, targetClassName: string): Observable<BillingTemplate> {
        let params: HttpParams = new HttpParams()
            .set("targetClassIdentifier", targetClassIdentifier)
            .set("targetClassName", targetClassName);

        return this.httpClient.get("/gnomex/GetBillingTemplate.gx", {params: params}).pipe(map((result: any) => {
            if (result && result.idBillingTemplate) {
                return BillingService.parseBillingTemplate(result);
            } else {
                return null;
            }
        }));
    }

    public static parseBillingTemplate(template: any): BillingTemplate {
        let billingTemplateItems: any[] = UtilService.getJsonArray(template.BillingTemplateItem, template.BillingTemplateItem);
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
        template.items = billingTemplateItems;

        return (template as BillingTemplate);
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

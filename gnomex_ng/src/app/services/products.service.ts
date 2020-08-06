import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {CookieUtilService} from "./cookie-util.service";
import {Observable} from "rxjs";
import {HttpUriEncodingCodec} from "./interceptors/http-uri-encoding-codec";

@Injectable()
export class ProductsService {
    public static readonly PRODUCT_TYPE_CLASS: string = "hci.gnomex.model.ProductType";

    constructor(private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService) {
    }

    public getProductList(): Observable<any> {
        return this.httpClient.get("/gnomex/GetProductList.gx");
    }

    public saveProduct(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/SaveProduct.gx", null, {params: params});
    }

    public deleteProduct(idProduct: string): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        let params: HttpParams = new HttpParams().set("idProduct", idProduct);
        return this.httpClient.post("/gnomex/DeleteProduct.gx", null, {params: params});
    }

    public getPriceCategories(requireIsActive: boolean, priceSheetName: string): Observable<any> {
        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
            .set("requireIsActive", requireIsActive ? "Y" : "N")
            .set("priceSheetName", priceSheetName);
        return this.httpClient.get("/gnomex/GetPriceCategories.gx", {params: params});
    }

    public deleteProductType(dataFields: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        dataFields = dataFields
            .set("action", "delete")
            .set("className", ProductsService.PRODUCT_TYPE_CLASS);
        return this.httpClient.post("/gnomex/ManageDictionaries.gx", null, {params: dataFields});
    }

    public saveProductType(dataFields: HttpParams, insertMode: boolean): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        dataFields = dataFields
            .set("action", insertMode ? "add" : "save")
            .set("className", ProductsService.PRODUCT_TYPE_CLASS);
        return this.httpClient.post("/gnomex/ManageDictionaries.gx", null, {params: dataFields});
    }

    public saveNewProductPriceCategory(name: string): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
            .set("name", name.trim())
            .set("isActive", "Y")
            .set("isNewProductPriceCategory", "Y")
            .set("stepsJSONString", JSON.stringify([]))
            .set("noJSONToXMLConversionNeeded", "Y");
        return this.httpClient.post("/gnomex/SavePriceCategory.gx", null, {params: params});
    }

    public getProductLedgerList(idLab?: string, idProduct?: string): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("idLab", idLab ? idLab : "")
            .set("idProduct", idProduct ? idProduct : "");
        return this.httpClient.get("/gnomex/GetProductLedgerList.gx", {params: params});
    }

    public getProductLedgerEntries(idLab: string, idProduct: string): Observable<any> {
        let params: HttpParams = new HttpParams()
            .set("idLab", idLab)
            .set("idProduct", idProduct);
        return this.httpClient.get("/gnomex/GetProductLedgerEntries.gx", {params: params});
    }

    public saveProductLedgerEntry(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/SaveProductLedgerEntry.gx", null, {params: params});
    }

    public saveProductLedgerEntryList(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/SaveProductLedgerEntryList.gx", null, {params: params});
    }

    public getCoreFacilityLabList(): Observable<any> {
        return this.httpClient.get("/gnomex/GetCoreFacilityLabList.gx");
    }

    public getProductOrderList(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetProductOrderList.gx", {params: params});
    }

    public getProductOrderLineItemList(params: HttpParams): Observable<any> {
        return this.httpClient.get("/gnomex/GetProductOrderLineItemList.gx", {params: params});
    }

    public deleteProductLineItems(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/DeleteProductLineItems.gx", null, {params: params});
    }

    public changeProductOrderStatus(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/ChangeProductOrderStatus.gx", null, {params: params});
    }

    public getProductOrder(idProductOrder: string): Observable<any> {
        let params: HttpParams = new HttpParams().set("idProductOrder", idProductOrder);
        return this.httpClient.get("/gnomex/GetProductOrder.gx", {params: params});
    }

    public saveProductOrder(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/SaveProductOrder.gx", null, {params: params});
    }

}

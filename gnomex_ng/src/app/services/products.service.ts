import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {CookieUtilService} from "./cookie-util.service";
import {Observable} from "rxjs/Observable";

@Injectable()
export class ProductsService {
    public static readonly PRODUCT_TYPE_CLASS: string = "hci.gnomex.model.ProductType";

    constructor(private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService,) {
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
        let params: HttpParams = new HttpParams()
            .set("requireIsActive", requireIsActive ? 'Y' : 'N')
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
        let params: HttpParams = new HttpParams()
            .set("name", name.trim())
            .set("isActive", "Y")
            .set("isNewProductPriceCategory", "Y")
            .set("stepsJSONString", JSON.stringify([]))
            .set("noJSONToXMLConversionNeeded", "Y");
        return this.httpClient.post("/gnomex/SavePriceCategory.gx", null, {params: params});
    }

}

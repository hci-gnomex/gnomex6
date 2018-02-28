import {Injectable} from "@angular/core";
import {Http, Headers, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';
import {Subject} from "rxjs/Subject";
import {CookieUtilService} from "./cookie-util.service";


@Injectable()
export class ConfigurationService {
    private coreListSubject: Subject<any> = new Subject();

    constructor(private http: Http, private cookieUtilService: CookieUtilService) {
    }

    public getUploadURLCall(): Observable<Response> {
        return this.http.get("/gnomex/UploadAndBroadcastEmailURLServlet.gx");
    }

    public getUploadURL(): Observable<any> {
        return this.getUploadURLCall().map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                return null;
            }
        });
    }

    emitCoreList(data:any): void {
        this.coreListSubject.next(data);
    }

    getCoreListObservable(): Observable<any> {
        return this.coreListSubject.asObservable();
    }
    saveCoreFacility(params:URLSearchParams): Observable<any>{
        this.cookieUtilService.formatXSRFCookie();
        return this.http.post("/gnomex/SaveCoreFacility.gx",params)
            .map((response: Response) => {
                if (response.status === 200) {
                    return response.json();
                }
            }).catch((err) =>{

                console.log(err);
                return Observable.throw(err);
            });
    }






}
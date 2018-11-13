import {Injectable} from "@angular/core";
import {Http, Headers, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs";
import {Subject} from "rxjs";
import {CookieUtilService} from "./cookie-util.service";
import {map} from "rxjs/operators";


@Injectable()
export class ConfigurationService {
    private coreListSubject: Subject<any> = new Subject();

    constructor(private http: Http, private cookieUtilService: CookieUtilService) {
    }

    public getUploadURLCall(): Observable<Response> {
        return this.http.get("/gnomex/UploadAndBroadcastEmailURLServlet.gx");
    }

    public getUploadURL(): Observable<any> {
        return this.getUploadURLCall().pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                return null;
            }
        }));
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
            .pipe(map((response: Response) => {
                if (response.status === 200) {
                    return response.json();
                }
            }));
    }






}
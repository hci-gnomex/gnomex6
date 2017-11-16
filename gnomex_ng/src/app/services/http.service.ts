import {EventEmitter, Injectable} from "@angular/core";
import {Http, RequestOptionsArgs, Response} from '@angular/http';
import {Observable} from "rxjs/Observable";
import 'rxjs/add/operator/map';

@Injectable()
export class HttpService {

    constructor() {
    }

    static getJson(http: Http, url: string, options?: RequestOptionsArgs, debugText?: string): Observable<any> {
        let emitter: EventEmitter<any> = new EventEmitter();
        this.getObservable(http, url, options, debugText).subscribe((response) => {
            emitter.emit(response);
            emitter.complete();
        });
        return emitter.asObservable();
    }

    static getObservable(http: Http, url: string, options?: RequestOptionsArgs, debugText?: string): Observable<Response> {
        if (debugText) {
            console.log("Http get: " + debugText);
        }
        return http.get(url, options).map((response: Response) => {
            if (response.status === 200) {
                if (debugText) {
                    console.log("Http success: " + debugText);
                }
                return response.json();
            } else {
                if (debugText) {
                    console.log("Http error: " + debugText);
                }
                throw new Error("Error");
            }
        });
    }

}
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";

@Injectable()
export class AddHttpHeaderInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let contentType: string = "";
        if(!(req.responseType === "blob")) {
            if(req.headers.has("Content-Type")) {
                contentType = req.headers.get("Content-Type");
                if(!contentType.includes("charset")) {
                    contentType = contentType + "; charset=UTF-8";
                }
            } else if (req.method.toLocaleUpperCase() === "GET") {
                contentType = "application/json; charset=UTF-8";
            } else if (req.method.toLocaleUpperCase() === "POST") {
                contentType = "application/x-www-form-urlencoded; charset=UTF-8";
            }
        }

        if(contentType) {
            const clonedRequest = req.clone({ headers: req.headers.set("Content-Type", contentType) });
            return next.handle(clonedRequest);
        } else {
            return next.handle(req);
        }
    }

}


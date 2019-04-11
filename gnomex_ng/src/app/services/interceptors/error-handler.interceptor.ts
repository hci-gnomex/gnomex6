import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse
} from "@angular/common/http";
import {Injectable, Injector} from "@angular/core";
import {Observable, throwError} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {Http} from "@angular/http";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";
import {error} from "selenium-webdriver";

@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {

    constructor(){
    }

    private errHandler = (error:IGnomexErrorResponse) : Observable<never>  => {
        let errorMessage= '';
        if(error.error instanceof ErrorEvent){
            errorMessage  ="Client side Error: " +  error.error.message;
            error.gError = {message: errorMessage}

        }else if(error.error && !error.gError){
            errorMessage  = `Server Side Error: ${error.status}\nMessage: ${error.message}`;
            error.gError = {
                message: errorMessage,
                result: error.error,
                status: error.status,
                url: error.url
            }

        }

        return throwError(error);
    };



    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>  {
        return next.handle(request).pipe(map((event:HttpEvent<any>) =>{
            if(event instanceof HttpResponse){
                let body = event.body;
                if(body && (body.result === 'ERROR' || body.result === 'INVALID')
                    && body.message){
                    let error:any  = new HttpErrorResponse({});
                    error.gError = {
                        message : body.message,
                        result: body.result,
                        status: event.status,
                        url: event.url
                    };
                    throw error;
                }
            }
            return event;
        }), catchError(this.errHandler));

    }

}


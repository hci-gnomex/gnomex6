import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpRequest,
    HttpEventType,
    HttpResponse,
    HttpHeaders,
    HttpErrorResponse
} from '@angular/common/http';
import {BehaviorSubject, concat, Observable, ObservableInput, throwError,} from 'rxjs';
import {Http,URLSearchParams,Response} from "@angular/http";
import {catchError, concatMap, first, map} from "rxjs/operators";

//const url = 'http://localhost:3000/upload';

@Injectable()
export class UploadFileService {
    constructor(private http: Http) {}



    public uploadFromBrowse(files: any[], url:string, ids:any): Observable<any> {
        let idKeys:string[] = Object.keys(ids);
        let idKey:string = idKeys[0];
        console.log(files);
        let fileUploadObservableList: ObservableInput<any>[] = [];

        files.forEach(file => {
            // create a new multipart-form for every file
            let formData = new FormData();
            // create a http-post request and pass the form
            // tell it to report the upload progress
            formData.append(idKey, ids[idKey]);
            formData.append("Filename", file.name);
            formData.append("Filedata", file.file, file.name);
            formData.append("Upload", "Submit Query");

            fileUploadObservableList.push(this.http.post(url,formData,{withCredentials:true})
                .pipe(map((resp: Response) =>{
                    return resp.json();
                }))
            );
        });
        return concat<any,any>(...fileUploadObservableList).pipe(catchError(this.handleError));
    }



    private handleError(errorResponse: HttpErrorResponse){
        if(errorResponse.error instanceof ErrorEvent){
            console.error("Client side Error: ", errorResponse.error.message);
        }else{
            console.log("Server Side Error: ", errorResponse);
        }
        return throwError("An error occured please contact GNomEx Support.");
    }

}
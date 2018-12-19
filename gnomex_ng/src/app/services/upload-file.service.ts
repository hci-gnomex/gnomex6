import { Injectable } from '@angular/core';
import {HttpClient, HttpRequest, HttpEventType, HttpResponse, HttpHeaders} from '@angular/common/http';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';

//const url = 'http://localhost:3000/upload';

@Injectable()
export class UploadFileService {
    constructor(private http: HttpClient) {}

    public upload(files: Set<File>, url:string, ids:any): { [key: string]: Observable<number> } {
        // this will be the our resulting map
        const status = {};
        let allFileProgress : number = 0;
        let allFileTotal: number = 0;

        files.forEach(file => {
            // create a new multipart-form for every file
            let formData = new FormData();
            // create a http-post request and pass the form
            // tell it to report the upload progress

            formData.append("Filename", file.name);
            formData.append("Filedata", file, file.name);
            formData.append("Upload", "Submit Query");

            if(ids){
                for(let key in ids){
                    formData.append(key, ids[key]);
                }
            }

            /*const req = new HttpRequest('POST', url, formData, {
                reportProgress: true
            });*/

            // create a new progress-subject for every file
            const progress = new Subject<number>();


            // send the http-request and subscribe for progress-updates

            let startTime = new Date().getTime();

            this.http.post(url,formData).subscribe(event => {
                console.log(event);
                /*if (event.type === HttpEventType.UploadProgress) {
                    // calculate the progress percentage

                    allFileProgress += event.loaded;
                    allFileTotal += event.total;
                    const percentDone = Math.round((100 * allFileProgress) /allFileTotal);

                    setTimeout(() =>{
                        progress.next(percentDone);
                    });

                    // pass the percentage into the progress-stream

                } else if (event instanceof HttpResponse) {
                    // Close the progress-stream if we get an answer form the API
                    // The upload is complete
                    progress.complete();
                }*/
            });

            // Save every progress-observable in a map of all observables
            status[file.name] = {
                progress: progress.asObservable()
            };
        });

        // return the map of progress.observables
        return status;
    }
}
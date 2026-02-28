import {HttpErrorResponse} from "@angular/common/http";

export interface IGnomexErrorResponse extends HttpErrorResponse {
   gError:{
       message:string;
       result?:string;
       status?:number;
       url?:string;
   }
}
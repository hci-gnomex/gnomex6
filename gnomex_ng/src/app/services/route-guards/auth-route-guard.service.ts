import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import {AuthenticationService} from "@hci/authentication";
import {ExperimentsService} from "../../experiments/experiments.service";
import {Injectable} from "@angular/core";
import {GnomexService} from "../gnomex.service";
import {URLSearchParams} from "@angular/http";
import {HttpParams} from "@angular/common/http";

/**
 * A {@code CanActivate} implementation which makes its calculation based on the current authentication state.
 *
 * @since 1.0.0
 *
 */
@Injectable()
export class AuthRouteGuardService implements CanActivate {



    constructor(private _authenticationService: AuthenticationService,
                private _router: Router,
                private gnomexService: GnomexService
    ){

    }
    /**
     * Determines whether or not a route can be activated, based on the current authentication state.
     *
     * @param route for activation to be determined on
     * @param state of the router snapshot
     * @returns {Observable<boolean>} describing the result of this calculation
     */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>{
        console.log(route.queryParams);
        console.log("home guard is being hit");

        let paramNumb:number = Object.keys(route.queryParams).length;


        return this._authenticationService.isAuthenticated()
            .flatMap(auth =>{
                // Store the attempted URL for redirecting
                this._authenticationService.redirectUrl = state.url;
                if(paramNumb > 0){
                    return this.determineIfPublic(route.queryParams,auth,state.url)
                }else{
                        if (!auth) {
                            // Store the attempted URL for redirecting
                            this._authenticationService.redirectUrl = state.url;
                            // Navigate to the login page
                            this._router.navigate(["authenticate"]);
                        }
                        return Observable.of(auth);
                }
            })

    }


    private determineIfPublic(queryParam:any,isAuthed:boolean, url: string):Observable<boolean> {
        let numberObj: any = {};
        if (queryParam["requestNumber"]) {
            numberObj["type"] = "requestNumber";
            numberObj["value"] = queryParam["requestNumber"];
            numberObj["urlSegList"] =  ["experiments","idProject","browsePanel","idRequest"];

        } else if (queryParam["analysisNumber"]) {
            numberObj["type"] = "analysisNumber";
            numberObj["value"] = queryParam["analysisNumber"];
            numberObj["urlSegList"] =  ["analysis","idLab","analysisPanel","idAnalysis"];


        } else if (queryParam["dataTrackNumber"]) {
            numberObj["type"] = "dataTrackNumber";
            numberObj["value"] = queryParam["dataTrackNumber"];
            numberObj["urlSegList"] =  ["datatracks","idGenomeBuild","datatracksPanel","idDataTrack"];

        } else if (queryParam["topicNumber"]) {
            numberObj["type"] = "topicNumber";
            numberObj["value"] = queryParam["topicNumber"];
            numberObj["urlSegList"] =  ["topics","topicsPanel","idLab"]; // no getTopic
        } else {
            numberObj = null;
        }

        if(!numberObj){
            return Observable.of(false);
        }

        let params:HttpParams = new HttpParams()
            .set(numberObj.type, numberObj.value);


        return this.gnomexService.getOrderFromNumber(params).map((res) =>{
            this.setIDsFromResponse(res,numberObj);
            this.gnomexService.orderInitObj = numberObj;

            if(res.codeVisbility === "PUBLIC" && !isAuthed ){ // has guest access
                numberObj["isGuest"] = true;
                return true;
            }else if(isAuthed){ //allow them to route, but backend will not show order if not permitted access(flex approach)
                numberObj["isGuest"] = false;
                return true;
            }
            else{ //the order isn't public and they haven't signed in. Make them sign in
                this._authenticationService.redirectUrl = "/" + numberObj.urlSegList[0];
                this._router.navigate(["authenticate"]);
                return false;
            }
        });

    }

    private setIDsFromResponse(resp:any,orderInfo:any){
        let idList:Array<any> = Object.keys(resp);
        for(let idKey  of idList){
            if(idKey === 'result' || idKey === 'codeVisbility'){
                continue;
            }else{
                orderInfo[idKey] = resp[idKey];
            }
        }
        
        if(orderInfo){
            this.gnomexService.redirectURL =this.gnomexService.makeURL(orderInfo);
        }

    }

}
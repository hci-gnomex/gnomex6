import {Injectable} from "@angular/core";

import {HttpClient, HttpParams} from "@angular/common/http";
import {forkJoin, Observable, Subject, Subscription} from "rxjs";
import {ParamMap, Router, UrlSegment, UrlSegmentGroup, UrlTree} from "@angular/router";
import {IRequiredParam} from "../util/interfaces/navigation-definition.model";

@Injectable()
export class NavigationService {
    private _resetNavModeSubscription:Subscription;
    private resetNavModeSubject: Subject<any> = new Subject<any>();
    navMode: string;
    public static readonly URL = 'url';
    public static readonly USER = 'usr';



    constructor(private http: HttpClient, private router:Router) {
    }


    public emitResetNavModeSubject(segment:string):void{
        //this is the segment of route that cooridnates with component that has finished all preselections it needed for
        //for navigating via url
        if(segment){
            this.resetNavModeSubject.next(segment);
        }

    }
    /*only call this start of app keep subscribed is intentional  */
    public resetNavModeFN():void {
        if(!this._resetNavModeSubscription){ // ensuring one subscriber for the whole app
            this._resetNavModeSubscription = this.resetNavModeSubject.subscribe((currentSeg:string)=>{
                let lastSegs: UrlSegment[]  =  this.getLastRouteSegments();
                let lastSegInRoute = '';
                if(lastSegs && lastSegs.length > 0){
                    lastSegInRoute =  (lastSegs[ lastSegs.length - 1]).path;
                }
                if(lastSegInRoute === currentSeg){
                    this.navMode = NavigationService.USER;
                }

            });
        }
    }

    public createNavDef(requiredParams:IRequiredParam[], params: HttpParams, qParamMap:ParamMap,navToViewMap:any) {
        let navDef: any = {requiredParams:[] , optionalParams:{queryParams:{}}};
        for(let i = 0; i < requiredParams.length; i++){
            let key:string = Object.keys(requiredParams[i])[0];
            let idWithPath = requiredParams[i][key];
            if(idWithPath){
                navDef.requiredParams.push(key+ "/"+ params.get(idWithPath));
            }else{
                navDef.requiredParams.push(key);
            }

            if(i == 0 && navDef.requiredParams[i]){
                navDef.requiredParams[i] = "/"+ navDef.requiredParams[i];
            }

        }
        let keys: string[] =  params.keys();
        for(let k of keys){
            let skipKey = false;
            for(let rp of requiredParams){
                let rpkey = Object.keys(rp)[0];
                if(rp[rpkey] === k){
                    skipKey = true;
                }
            }
            if (!navToViewMap[k]){
                skipKey = true;
            }


            let idWithParamName = params.get(k);
            if(idWithParamName && !skipKey ){
                navDef.optionalParams.queryParams[k] = idWithParamName;
            }

        }
        // mark queryParams for removal that aren't in httpParams
        for(let qParam of qParamMap.keys){
            if(!params.get(qParam)){
                navDef.optionalParams.queryParams[qParam] = null;
            }
        }



        return navDef;
    }


    getLastRouteSegments() : UrlSegment[]{
        let url:string = this.router.url;
        let root =  this.router.parseUrl(url).root;
        return this.recurseGetLastRouteSegments(root);
    }

    recurseGetLastRouteSegments(urlSegGroup:UrlSegmentGroup) : UrlSegment[] {
        if(!urlSegGroup.hasChildren()){
            return urlSegGroup.segments;
        }
        let segGroup = null;
        for(let sgChild in urlSegGroup.children ){
            segGroup = this.recurseGetLastRouteSegments(urlSegGroup.children[sgChild]);
            if(segGroup){
                break;
            }
        }
        return segGroup;

    }



}
import {Injectable} from "@angular/core";

import {HttpClient, HttpParams} from "@angular/common/http";
import {forkJoin, Observable, Subject, Subscription} from "rxjs";
import {
    NavigationStart,
    ParamMap,
    Router,
    UrlSegment,
    UrlSegmentGroup,
    Event as NavigationEvent,
    ActivatedRoute
} from "@angular/router";
import {IRequiredParam} from "../util/interfaces/navigation-definition.model";
import {filter} from "rxjs/operators";
import {NavigationItem} from "typedoc";
import {ITreeNode} from "angular-tree-component/dist/defs/api";

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
                let lastSegInRoute =  this.getLastRouteSegment();
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
        let paramKeys: string[] =  params.keys();
        for(let k of paramKeys){
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


    getLastRouteSegment() : string {
        let url:string = this.router.url;
        let root =  this.router.parseUrl(url).root;


        let lastSegs: UrlSegment[] = this.recurseGetLastRouteSegments(root);
        let lastSegIndex: number = null;
        let lastSegInRoute = null;

        if(lastSegs && lastSegs.length > 0){
            for(let i = lastSegs.length - 1; i >= 0; i-- ){
                if (isNaN(parseInt(lastSegs[i].path))){ // we don't care about ids only path names
                    lastSegIndex = i;
                    break;
                }
            }
            lastSegInRoute = lastSegs[lastSegIndex].path;
        }
        return lastSegInRoute;
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

    trackNavState(){
        this.router.events
            .pipe(
                filter(( event: NavigationEvent ) => {
                    return( event instanceof NavigationStart );
                })
            ).subscribe(( event: NavigationStart ) => {

                console.debug( "trigger:", event.navigationTrigger );

                if ( event.restoredState && event.navigationTrigger === 'popstate' ) {
                    console.debug("restoring navigation id:", event.restoredState.navigationId);
                    console.debug("Back or forward button pressed on browser");
                    this.navMode = NavigationService.URL;

                }


            }
        );

    }


    getChildActivateRoute(route:ActivatedRoute):ActivatedRoute{
        let activateRoute = route;
        while(true){
            if(activateRoute.children.length > 0){
                activateRoute = activateRoute.children[0];
            }else{
                break;
            }
        }
        return activateRoute;
    }
    setValueGoingUpTree(idObjList:any[],node:ITreeNode){
        return this.recurseSetValueGoingUpTree(node, idObjList, idObjList.length - 1);
    }
    private recurseSetValueGoingUpTree(node:ITreeNode, idObjList:any[],index:number){
        if(index < 0 || !node){
            return idObjList;
        }
        let idName = Object.keys(idObjList[index])[0];


        idObjList[index][idName] = node.data[idName];

        // if idName is still found on parent node stay current index
        let decCount = node.parent.data[idName] ? 0 : 1 ;
        let targetNode = idObjList[index][idName] ? node.parent : node;
        return this.recurseSetValueGoingUpTree(targetNode,idObjList,index - decCount);

    }



}
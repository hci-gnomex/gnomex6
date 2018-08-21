import {Injectable, OnDestroy} from "@angular/core";
import {Http,Headers, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {HttpClient, HttpParams} from "@angular/common/http";
import {CookieUtilService} from "./cookie-util.service";
import {ExperimentPlatformTabComponent} from "../configuration/experiment-platform/experiment-platform-tab.component";
import {EpSampleTypeTabComponent} from "../configuration/experiment-platform/ep-sample-type-tab.component";
import {DictionaryService} from "./dictionary.service";
import {Subject} from "rxjs";

@Injectable()
export class ExperimentPlatformService implements OnDestroy{
    private reqCategorySubject:BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private expPlatformTypeChange: Subject<any> = new Subject<any>();
    private expPlatformListSubject: Subject<any> = new Subject<any>();

    private _selectedType:any;



    constructor(private cookieUtilService: CookieUtilService,
                private httpClient: HttpClient,
                private dictionaryService:DictionaryService) {
    }


    setExperimentPlatformState(reqCategory:any ):void{
        if(reqCategory){
            this._selectedType = this.dictionaryService.getEntry(DictionaryService.REQUEST_CATEGORY_TYPE, reqCategory.value)
        }

    }
    public get selectedType():any {
        return this._selectedType;
    }
    public set selectedType(selectedType:any) {
        this._selectedType = selectedType;
    }

    public  get isIllumina():boolean {
        if (this._selectedType && this._selectedType.isIllumina == 'Y') {
            return true;
        } else {
            return false;
        }
    }
    public get isHiSeq():boolean {
        if (this._selectedType && this._selectedType.value === 'HISEQ') {
            return true;
        } else {
            return false;
        }
    }
    public  get isMicroarray():boolean {
        return this._selectedType  && this._selectedType.value === 'MICROARRAY';
    }

    public  get isSequenom():boolean {
        return this._selectedType && this._selectedType.value === 'SEQUENOM';
    }

    public get isNanoString():Boolean {
        return this. _selectedType  && this._selectedType.value === 'NANOSTRING';
    }

    public get isQC():Boolean {
        return this._selectedType && this.selectedType.value === 'QC';
    }

    getExperimentPlatformTabList():string[]{
        if(this.isIllumina || this.isNanoString || this.isSequenom){
            return ['ExperimentPlatformTabComponent',
                    'EpSampleTypeTabComponent', "EpLibraryPrepTabComponent","EpPropertyTabComponent"]
        }else if(this.isQC){
            return ['ExperimentPlatformTabComponent', 'EpSampleTypeTabComponent',"EpPropertyTabComponent"]
        }else{
            return ['ExperimentPlatformTabComponent', 'EpSampleTypeTabComponent']
        }
    }


    emitExperimentPlatformList(data:any){
        this.expPlatformListSubject.next(data);
    }
    getExperimentPlatformList_fromBackend(){
        return this.httpClient.get("/gnomex/GetExperimentPlatformList.gx")
            .subscribe(resp =>{
                  this.emitExperimentPlatformList(resp);
            })
    }

    getExperimentPlatformListObservable(): Observable<any>{
        return this.expPlatformListSubject.asObservable();

    }
    getExperimentPlatformSortOrderList(params:HttpParams): Observable<any>{
        //this.cookieUtilService.formatXSRFCookie();
        //return this.httpClient.post("/gnomex/MakeDataTrackIGVLink.gx",null);
        return this.httpClient.get("/gnomex/GetExperimentPlatformSortOrderList.gx",{params: params});

    }


    emitExperimentPlatform(data:any){
        this.reqCategorySubject.next(data);
    }
    getExperimentPlatformObservable():Observable<any>{
        return this.reqCategorySubject.asObservable();
    }

    emitExperimentPlatformTypeChange(data:any){
        this.expPlatformTypeChange.next(data);
    }
    getExperimentPlatformTypeChangeObservable(): Observable<any>{
        return this.expPlatformTypeChange.asObservable();
    }





    ngOnDestroy(){
        console.log("Service Destroyed")
    }


    saveExperimentPlatformSortOrderList(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/SaveExperimentPlatformSortOrderList.gx",null,{params:params});
    }
}
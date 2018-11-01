import {Injectable, OnDestroy} from "@angular/core";
import {Http,Headers, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {CookieUtilService} from "./cookie-util.service";
import {ExperimentPlatformTabComponent} from "../configuration/experiment-platform/experiment-platform-tab.component";
import {EpSampleTypeTabComponent} from "../configuration/experiment-platform/ep-sample-type-tab.component";
import {DictionaryService} from "./dictionary.service";
import {Subject} from "rxjs";
import {AbstractControl, FormGroup} from "@angular/forms";

@Injectable()
export class ExperimentPlatformService implements OnDestroy{
    private reqCategorySubject:BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private expPlatformTypeChange: Subject<any> = new Subject<any>();
    private expPlatformListSubject: Subject<any> = new Subject<any>();
    private _expPlatformOverviewForm: FormGroup;
    private propertyListSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);



    private _selectedType:any;



    constructor(private cookieUtilService: CookieUtilService,
                private httpClient: HttpClient,
                private dictionaryService:DictionaryService) {
        this._expPlatformOverviewForm = new FormGroup({});
    }

    get expPlatformOverviewForm():FormGroup{
        return this._expPlatformOverviewForm;
    }


    setExperimentPlatformState(reqCategory:any ):void{
        if(reqCategory && reqCategory.codeRequestCategoryType){
            this._selectedType = this.dictionaryService.getEntry(DictionaryService.REQUEST_CATEGORY_TYPE, reqCategory.codeRequestCategoryType);
        }else{
            this._selectedType = this.dictionaryService.getEntry(DictionaryService.REQUEST_CATEGORY_TYPE, reqCategory.type);
        }

    }
    initExpPlatformForm(formName:string, remove:boolean):void {
        let tabForm = this._expPlatformOverviewForm.get(formName);
        if(tabForm){
            if(remove){
                this._expPlatformOverviewForm.removeControl(formName);
            }else{
                tabForm.reset();
            }
        }
    }


    removeExpPlatformMember(name:string,afterControlAddedfn?:any){
        if(this._expPlatformOverviewForm.controls[name]){
            this._expPlatformOverviewForm.removeControl(name);
        }
    }

    addExpPlatformFormMember(control: AbstractControl, name:string,afterControlAddedfn?:any):void{
        this._expPlatformOverviewForm.addControl(name, control);
        if(afterControlAddedfn){
            afterControlAddedfn();
        }
    }
    findExpPlatformFormMember(path:string):AbstractControl{
        return this._expPlatformOverviewForm.get(path);
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
            let illuminaLikeList:string[] = [
                'ExperimentPlatformTabComponent',
                'EpSampleTypeTabComponent',
                'EpExperimentTypeIlluminaTabComponent',
                "EpIlluminaSeqTabComponent",
                "EpLibraryPrepQCTabComponent",
                "EpPipelineProtocolTabComponent",
                "ConfigureAnnotationsComponent"
            ];
            if(!this.isIllumina){
                illuminaLikeList.splice(2,1);
            }
            return illuminaLikeList;
        }else if(this.isQC){
            return [
                'ExperimentPlatformTabComponent',
                'EpSampleTypeTabComponent',
                "EpExperimentTypeQcTabComponent",
                "ConfigureAnnotationsComponent"];
        }else{
            return [
                'ExperimentPlatformTabComponent',
                'EpSampleTypeTabComponent',
                'EpExperimentTypeTabComponent',
                'ConfigureAnnotationsComponent',
                "EpPrepTypesTabComponent"
            ];
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
    emitPropertyList(data:any):void{
        this.propertyListSubject.next(data);
    }
    getPropertyListObservable():Observable<any>{
        return this.propertyListSubject.asObservable();
    }






    ngOnDestroy(){
        console.log("Service Destroyed")
    }

    saveExperimentPlatform(params:HttpParams): Observable<any>{
        let headers : HttpHeaders = new HttpHeaders().set('Content-Type','application/x-www-form-urlencoded');
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/SaveExperimentPlatform.gx",params.toString(),{headers: headers})
    }

    saveExperimentPlatformSortOrderList(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/SaveExperimentPlatformSortOrderList.gx",null,{params:params});
    }

    deleteExperimentPlatform(params: HttpParams): Observable<any> {
        this.cookieUtilService.formatXSRFCookie();
        return this.httpClient.post("/gnomex/DeleteExperimentPlatform.gx",null,{params:params})
    }
}
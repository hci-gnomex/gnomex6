import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {Injectable} from "@angular/core";
import {IAnnotation} from "../util/interfaces/annotation.model";

@Injectable()
export class BrowseOrderValidateService {
    private _dirtyNote:boolean = false;
    private orderValidateSubject:Subject<any> = new Subject();
    private _downloadDTList: any[];
    private _annotationsToSave: IAnnotation[];


    constructor() {}

    get dirtyNote(){
        return this._dirtyNote;
    }
    set dirtyNote(data:boolean){
        this._dirtyNote = data;
    }
    get downloadDTList(): any[]{
        return this._downloadDTList;
    }
    set downloadDTList(downloadList: any[]){
        this._downloadDTList = downloadList;
    }
    get annotationsToSave():IAnnotation[]{
        return this._annotationsToSave;
    }
    set annotationsToSave(annots: IAnnotation[]){
        this._annotationsToSave = annots;
    }




    emitOrderValidateSubject():void{
        this.orderValidateSubject.next();
    }
    getOrderValidateObservable():Observable<any>{
        return this.orderValidateSubject.asObservable();
    }

    resetValidation(){
        this._downloadDTList = [];
        this.dirtyNote = false;
        this.orderValidateSubject = new Subject();
        this._annotationsToSave = [];

    }

}
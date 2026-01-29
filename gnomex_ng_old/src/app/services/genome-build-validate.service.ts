import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {Observable} from "rxjs";


@Injectable()
export class GenomeBuildValidateService {
    private _dirtyNote:boolean = false;
    private segmentValidateSubject:Subject<any> = new Subject();
    private _errorMessageList:Array<string> = [];
    private _segmentsList: Array<any> = [];
    private _sequenceFilesList: Array<any> = [];
    private _detailsForm: any;




    constructor() {}

    get dirtyNote(){
        return this._dirtyNote;
    }
    set dirtyNote(data:boolean){
        this._dirtyNote = data;
    }
    get segmentsList(){
        return this._segmentsList;
    }
    set segmentsList(data:Array<string>){
        this._segmentsList = data;
    }
    get sequenceFilesList(){
        return this._sequenceFilesList;
    }
    set sequenceFilesList(data:Array<string>){
        this._sequenceFilesList = data;
    }
    get errorMessageList(){
        return this._errorMessageList;
    }
    set errorMessageList(data:Array<string>){
        this._errorMessageList = data;
    }
    get detailsForm(){
        return this._detailsForm;
    }
    set detailsForm(data:any){
        this._detailsForm = data;
    }


    emitValidateGenomeBuild():void{
          this.segmentValidateSubject.next();
    }
    getValidateGenomeBuildObservable():Observable<any>{
        return this.segmentValidateSubject.asObservable();
    }

    isPositiveInteger(value:any):boolean{
        let numAsStr:any = (<string>value).replace(",","")

        if(!isNaN(numAsStr)){ // typescript isNaN won't allow string, know work around is just use any
            let num: number  = +numAsStr;
            if(num > 0 ){
                return true;
            }
        }
        return false;


    }

    resetValidation(){
        this._segmentsList = [];
        this._sequenceFilesList = [];
        this._errorMessageList = [];
        this._detailsForm = null;
        this.dirtyNote = false;

    }


    segmentValidation(segments:Array<any>): void {
        let dupNames:Array<any> = [];
        let nameSet = new Set();

        for(let i = 0; i <  segments.length; i ++ ){
            segments[i].name = (<string>segments[i].name).trim();
            segments[i].length = (<string>segments[i].length).trim();
            segments[i].sortOrder = (<string>segments[i].sortOrder).trim();
            if(segments[i].name === ""){
                this.errorMessageList.push("Segment name is required");
            }
            if(!this.isPositiveInteger(segments[i].length)){
                this.errorMessageList.push("Segment length '" + segments[i].length + "' is invalid.")
            }
            if(!this.isPositiveInteger(segments[i].sortOrder)){
                this.errorMessageList.push("Segment order '" + segments[i].sortOrder + "' is invalid.")
            }
            if(nameSet.has(segments[i].name)){
                dupNames.push("Segment names " + segments[i].name + " are duplicated (must be unique)");
            }else{
                nameSet.add( segments[i].name );
            }
        }
        this.errorMessageList = this.errorMessageList.concat(dupNames);
    }






}

/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, forwardRef, Input, OnDestroy, OnInit} from "@angular/core";
import {ControlValueAccessor,FormGroup, NG_VALUE_ACCESSOR, Validators} from "@angular/forms";
import {IAnnotation, IPropertyEntryValue} from "./interfaces/annotation.model";
import {UtilService} from "../services/util.service";


export const URL_ANNOT_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => UrlAnnotationComponent),
    multi: true
};

@Component({
    selector: 'url-annotation',
    templateUrl: './url-annotation.component.html',
    providers:[URL_ANNOT_VALUE_ACCESSOR],

    styles: [`

        .flex-column-container{
            display:flex;
            flex-direction: column;
            
        }
        .annot-control{
            width:30%;
            margin:0.25em;
            font-size:small;
        }
        .annot-border{
            border-top: 1px solid #e8e8e8;
            border-bottom: 1px solid #e8e8e8;
        }
        .annot-label{
            align-self: center;
            font-weight: bold;
            margin:1em;
        }


    `]
})
export class UrlAnnotationComponent implements OnInit, OnDestroy, ControlValueAccessor{
    public annot:IAnnotation;
    private urlAnnotations: IPropertyEntryValue[] = [];
    private _onTouched = () =>{};
    private _onChange = (val:any)=>{};
    public urlDisabled:boolean = false;
    public url:string ='';
    public alias:string ='';


    constructor(private utilService: UtilService){
    }

    ngOnInit(){
    }

    toggleMode(urlObj:IPropertyEntryValue){
        if(urlObj.edit){
            urlObj.edit = false;
        }else{ // updating dom with whatever is in url/ alias text boxes
            urlObj.edit = true;
        }
    }

    makeLink(){
        if(this.alias && this.url){
            this.urlAnnotations.push(
                {
                    idPropertyEntryValue: '',
                    urlAlias: this.alias,
                    urlDisplay: this.alias,
                    url:this.url,
                    value: this.url + ',' + this.alias,
                    edit:false
                }
                );

            this.annot.value = this.url+','+ this.alias;
            this._onChange(this.annot);
        }

    }
    removeLink(index:number){
        this.urlAnnotations.splice(index, 1);
        this._onChange(this.annot);
    }

    writeValue(obj:IAnnotation){
       if(obj){
           // this.annotations = Array.isArray(annots) ? <IAnnotation[]>annots : <IAnnotation[]>[annots];

           this.annot = obj;
           let pev = obj.PropertyEntryValue;
           this.urlAnnotations = UtilService.getJsonArray(pev, pev);
           // writing PropertyEntryValue Array to Annot again because if only one item return it will be just an object
           // then I add that to an array thus breaking the connection between annot and its property 'PropertyEntryValue'
           this.annot.PropertyEntryValue = this.urlAnnotations;

           for (let annot of this.urlAnnotations) {
               annot.edit = false;
           }
       }else{
           this.urlAnnotations =[];
       }



    }
    registerOnChange(fn:any){
        this._onChange = fn;
    }
    registerOnTouched(fn:any){
        this._onTouched = fn;
    }
    setDisabledState(isDisabled:boolean){
        this.urlDisabled = isDisabled;
    }

    onTouched(){
        this._onTouched();
    }
    onChange(entry:IPropertyEntryValue){
        entry.value = entry.url + ',' + entry.urlAlias;
        this._onChange(this.annot);
    }




    ngOnDestroy(){

    }


}


/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import { Component, Input,OnDestroy, OnInit} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {IAnnotation} from "./interfaces/annotation.model";
import {selectRequired} from "./validators/select-required.validator";
import {MatDialog, MatDialogRef} from "@angular/material";
import {ConfigAnnotationDialogComponent} from "./config-annotation-dialog.component";

export enum OrderType{
    ANALYSIS = 'a',
    DATATRACK = 'dt',
    EXPERIMENT = 'e',
    NONE = ''
}



@Component({
    selector: 'annotation-tab',
    templateUrl: './annotation-tab.component.html',

    styles: [`


        .annot-control{
            width:30%;
            margin:0.25em;
            font-size:small;
        }
        .mat-tab-group-border{
            border: 1px solid #e8e8e8;
        }


`]
})
export class AnnotationTabComponent implements OnInit, OnDestroy{
    public annotationForm: FormGroup;
    private _annotations: IAnnotation[];
    private _disabled: boolean = false;
    private urlAnnotations: any[] = [];
    private types = OrderType;

    @Input() orderType = OrderType.NONE;
    @Input() set disabled(value:boolean){
        this._disabled = value;
        if(this.annotationForm){
            if(this._disabled){
                this.annotationForm.disable()
            }else{
                this.annotationForm.enable();
            }
        }

    }

    @Input() set annotations( a: IAnnotation[]){
        this._annotations = a;
        if(!this.annotationForm){
            this.annotationForm =  new FormGroup({});
        }

        this._annotations.forEach(annot => {
            this.annotationForm.addControl(annot.name, new FormControl());

            if(annot.codePropertyType === 'TEXT'){
                this.annotationForm.controls[annot.name].setValue(annot.value);
            }else if(annot.codePropertyType === 'CHECK'){
                this.annotationForm.controls[annot.name].setValue(annot.value === 'Y');
            }else if(annot.codePropertyType === 'MOPTION'){
                let split: string[] = annot.value.split(",");
                this.annotationForm.controls[annot.name].setValue(annot.value ? split : []);
            }else if(annot.codePropertyType === 'OPTION'){
                this.annotationForm.controls[annot.name].setValue(annot.value ? annot.value : '');
            } else if(annot.codePropertyType === 'URL'){
                this.initUrlAnnotations(annot.value)
            }

            if(annot.isRequired === 'Y'){
                if(annot.codePropertyType === 'TEXT'){
                    this.annotationForm.controls[annot.name].setValidators([Validators.required]);
                }else if(annot.codePropertyType === 'CHECK'){
                    this.annotationForm.controls[annot.name].setValidators([Validators.requiredTrue]);
                }else if(annot.codePropertyType === 'MOPTION' || annot.codePropertyType === 'OPTION' ){
                    this.annotationForm.controls[annot.name].setValidators(selectRequired());
                }
            }

        });
        this.annotationForm.markAsPristine();

    }

    get annotations(){
        return this._annotations;
    }




    constructor(private dialog: MatDialog){
    }

    ngOnInit(){
        if(this._disabled){
            this.annotationForm.disable();
        }else{
            this.annotationForm.enable();
        }

    }


    loadConfigAnnotations(){
        let dialogRef: MatDialogRef<ConfigAnnotationDialogComponent> = this.dialog.open(ConfigAnnotationDialogComponent, {
            height: '980px',
            data: {
                orderType: this.orderType
            }
        });
    }
    toggleMode(urlObj:any){
        if(urlObj.edit){
            urlObj.edit = false;
        }else{
            urlObj.edit = true;
        }
    }

    makeLink(name:any, url:any){
        let n = name.value;
        let u = url.value;
        if(n && u){
            this.urlAnnotations.push({name: n , link: u , edit:true });
        }

    }
    removeLink(index:number){
        this.urlAnnotations.splice(index, 1);
    }
    initUrlAnnotations(value:string):void{
        let s:string[] = value.split(",");
        for(let i = 0; i < s.length - 1; i++){
            let url = s[i];
            let name = s[i+1];
            this.urlAnnotations.push({name: name , link: url , edit:true});
        }
    }




    ngOnDestroy(){

    }


}


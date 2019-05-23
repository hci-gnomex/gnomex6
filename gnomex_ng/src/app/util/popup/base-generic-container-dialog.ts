import {Input} from "@angular/core";
import {ActionType, GDAction} from "../interfaces/generic-dialog-action.model";
import {FormGroup} from "@angular/forms";


export abstract class BaseGenericContainerDialog {
    public  primaryDisable: (action?:GDAction)=>boolean = (action) =>{
        return false;
    };
    public  secondaryDisable: (action?:GDAction)=>boolean = (action) =>{
        return false;
    };

    public dirty: ()=>boolean = () =>{ return false};
    public showSpinner: boolean = false;
    @Input() inputData:any;


    protected constructor(){
    }


}
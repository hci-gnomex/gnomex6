import {BehaviorSubject, Subject} from "rxjs/index";
import {Input} from "@angular/core";


export abstract class BaseGenericContainerDialog {
    public  disable: ()=>boolean = () =>{ return false};
    public dirty: ()=>boolean = () =>{ return false};
    public showSpinner: boolean = false;
    @Input() inputData:any;


    constructor(){
    }


}
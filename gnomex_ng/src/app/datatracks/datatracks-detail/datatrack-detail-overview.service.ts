import { Injectable} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";

@Injectable()
export class DatatrackDetailOverviewService {
    private _dtOverviewForm: FormGroup;

    constructor(private fb:FormBuilder ) {
        this._dtOverviewForm = this.fb.group({});
    }

    get dtOverviewForm (): FormGroup{
        return this._dtOverviewForm;
    }
    addFormToParent(name:string ,form:FormGroup):void{
        setTimeout(() =>{
            this._dtOverviewForm.addControl(name, form);
        });

    }



}
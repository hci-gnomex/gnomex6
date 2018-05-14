import { Injectable} from "@angular/core";
import 'rxjs/add/operator/map';
import {FormBuilder, FormGroup} from "@angular/forms";

@Injectable()
export class DatatrackDetailOverviewService {
    private _dtOveriewForm: FormGroup;

    constructor(private fb:FormBuilder ) {
        this._dtOveriewForm = this.fb.group({});
    }

    get dtOverviewForm (): FormGroup{
        return this._dtOveriewForm;
    }
    addFormToParent(name:string ,form:FormGroup):void{
        setTimeout(() =>{
            this._dtOveriewForm.addControl(name, form);
        });

    }



}
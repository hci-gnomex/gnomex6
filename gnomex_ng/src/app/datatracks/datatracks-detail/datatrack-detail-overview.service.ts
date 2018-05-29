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
            if(this._dtOverviewForm.get(name)){ // need to check incase control has been added to before say from dt screen
                                                // and your now trying to initalize it from the topics screen
                this._dtOverviewForm.removeControl(name);
            }
            this._dtOverviewForm.addControl(name, form);


        });

    }



}
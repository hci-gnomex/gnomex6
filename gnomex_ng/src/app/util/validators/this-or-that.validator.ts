import {FormControl, FormGroup} from "@angular/forms";
import {ExperimentViewService} from "../../services/experiment-view.service";

export function thisOrThat(controlName: string , controlPartnerName:string) {

    return (control: FormControl): {[key: string]: any} => { // typescript syntax returns a object key(string) value(any)
        let parent = control.parent;
        if(!parent){
            return null;
        }
        let sibling = parent.get(controlPartnerName);

        if((!control.value && sibling.value) || (control.value && !sibling.value) ){ // no problems
            if(sibling.invalid){ // if invalid check it so it becomes valid since this is the valid case
                sibling.updateValueAndValidity();
            }
            return null;
        }else if(control.value && sibling.value){
            return {thisOrThat: "either " + "activity" +  " or " +  "project" };
        } else{
            return {thisOrThat: "either " + "activity" +  " or " +  "project" };
        }

        //  pairs of type any.
        return null;
    }

}
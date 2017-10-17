import {FormControl} from "@angular/forms";
import {ExperimentViewService} from "../../services/experiment-view.service";

export function dependentControl(linker:string,rules:ExperimentViewService) {

    return (control: FormControl): {[key: string]: any} => { // typescript syntax returns a object key(string) value(any)
        if(control.errors && control.errors['dependentControl'] ){
            let controlName = null;
            let parent = control.parent;
            Object.keys(parent.controls).forEach((name) =>{
                if(control === parent.controls[name]){
                    controlName = name;
                }
            });
            let validators:Array<any> = rules.getControlValidator(controlName);
            control.setValidators(validators);

            return null;
        }
        //  pairs of type any.


        return  !!control.value
            ? {'dependentControl': "Please update value, you changed the " +  linker +
            " field which it has dependency on"} // assigning a object setting a attribute to restrictedWords
            : null
    }

}
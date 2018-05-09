import {AbstractControl, FormControl} from "@angular/forms";


export function selectRequired(){ // returns if its valid returns null or object if invalid defining the broken rule
    // we have key and value pair. key is a string, value is boolean
    return (c: FormControl): { [key: string]: boolean } | null => { // typescript syntax returns a array key value
        //  pairs of type any.}
        if(!c.value || c.value === ''){
            return {'selectRequired': true}
        }

        return null;

    }

}
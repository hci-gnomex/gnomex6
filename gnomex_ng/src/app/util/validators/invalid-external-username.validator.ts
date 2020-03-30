import {FormControl, Validators} from "@angular/forms";

export function invalidExternalUsrName(controlName:string, pattern:RegExp) {

    return (control: FormControl): {[key: string]: any} => { // typescript syntax returns a object key(string) value(any)
        let parent = control.root;
        if(!parent){
            return null;
        }
        let sibling = parent.get(controlName);
        if(!sibling){
            return null
        }


        if(!sibling.value){
            let regex:RegExp = pattern; ///^(?!u\d{7}).*$/i;
            if(regex.test(control.value)){
                return {invalidExternalUsrName:"The value cannot be a UID for an external user"}
            }
        }


        //  pairs of type any.
        return null;
    }

}
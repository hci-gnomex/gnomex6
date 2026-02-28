import {AbstractControl, FormControl} from "@angular/forms";


export function specialChars() { // returns if its valid returns null or object if invalid defining the broken rule
    // we have key and value pair. key is a string, value is boolean
    return (c: FormControl): { [key: string]: boolean } => { // typescript syntax returns a array key value
        //  pairs of type any.}
        let das2Control = c;
        let regex: RegExp = /\W/;
        if (!regex.test(das2Control.value)) {
            return null;
        }

        return {'specialChars': true}

    }
}





// let das2Control = c.get('das2Name');
// let regex: RegExp = /\W/;
// if(regex.test(das2Control.value)){
// let das2Control = c.get('das2Name');
// let regex: RegExp = /\W/;
// if(regex.test(das2Control.value)){
//     return { 'specialChars': true
// }
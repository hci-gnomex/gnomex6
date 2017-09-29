import {AbstractControl} from "@angular/forms";


export function emailMatcher(c: AbstractControl): { [key: string]: boolean } | null { // returns if its valid returns null or object if invalid defining the broken rule
    // we have key and value pair. key is a string, value is boolean
    let emailControl = c.get('email');
    let confirmControl = c.get('confirmEmail');
    if (emailControl.pristine || confirmControl.pristine) {
        return null;
    }
    if (emailControl.value === confirmControl.value) {
        return null;
    }
    return { 'match': true };// if we need to reference the validator in html we do ...errors.match,
}
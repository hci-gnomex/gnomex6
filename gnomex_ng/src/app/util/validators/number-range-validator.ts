import {FormControl, ValidatorFn} from "@angular/forms";

export function numberRange(min:number,max:number): ValidatorFn {

    return (control: FormControl): {[key: string]: any} => { // typescript syntax returns a object key(string) value(any)
        let isNaNError = false;
        if(!control.value){
            return null;
        }
        if(!Number.isNaN(Number.parseInt(control.value))){
            if(control.value >= min  && control.value <= max ){
                return null;
            }else{
                isNaNError = false;
            }
        }else{
            isNaNError = true;
        }
        //  pairs of type any.


        return  isNaNError
            ? {'numberRange': "value is not a number" }
            : {'numberRange': "valid range " + min + " - " + max   }
    }

}
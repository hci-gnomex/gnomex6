import {Injectable} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";

@Injectable()
export class UtilService {

    constructor() {
    }

    public static markChildrenAsTouched(group: FormGroup): void {
        group.markAsTouched();
        if (group.controls) {
            for (let key of Object.keys(group.controls)) {
                if (group.controls[key] instanceof FormGroup) {
                    UtilService.markChildrenAsTouched(group.controls[key] as FormGroup);
                } else if (group.controls[key] instanceof FormControl) {
                    group.controls[key].markAsTouched();
                }
            }
        }
    }

    public static getJsonArray(possibleArray: any, singleItem: any): any[] {
        return possibleArray ? (Array.isArray(possibleArray) ? possibleArray as any[] : [singleItem]) : [];
    }

}

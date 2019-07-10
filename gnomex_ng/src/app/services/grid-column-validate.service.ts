import {Injectable} from '@angular/core';
import {DialogsService, DialogType} from "../util/popup/dialogs.service";

@Injectable()
export class GridColumnValidateService {

    constructor(private dialogsService: DialogsService) { }

    validate(params) {
        let valid: boolean = true;
        if (params.newValue === "") {
            params.data[params.colDef.field] = "";
        } else if (params.newValue > params.colDef.maxValue) {
            this.dialogsService.alert("Value exceeded max of " + params.colDef.maxValue, null, DialogType.VALIDATION);
            valid = false;
        } else if (params.newValue < params.colDef.minValue) {
            this.dialogsService.alert("Value less than min of " + params.colDef.minValue, null, DialogType.VALIDATION);
            valid = false;
        } else if (params.newValue < 0) {
            this.dialogsService.alert("Value cannot be negative", null, DialogType.VALIDATION);
            valid = false;
        } else {
            valid = true;
            params.data[params.colDef.field] = params.newValue;
        }
        return valid;
    }
}

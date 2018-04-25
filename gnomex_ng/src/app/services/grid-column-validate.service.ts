import { Injectable } from '@angular/core';
import {DialogsService} from "../util/popup/dialogs.service";

@Injectable()
export class GridColumnValidateService {

    constructor(private dialogsService: DialogsService) { }

    validate(params) {
        let valid: boolean = true;
        if (params.newValue === "") {
            params.data[params.colDef.field] = "";
        } else if (params.newValue > params.colDef.maxValue) {
            this.dialogsService.confirm("Value exceeded max of "+params.colDef.maxValue, null);
            valid = false;
        } else if (params.newValue < params.colDef.minValue) {
            this.dialogsService.confirm("Value less than min of " + params.colDef.minValue, null);
            valid = false;
        } else if (params.newValue < 0) {
            this.dialogsService.confirm("Value cannot be negative", null);
            valid = false;
        } else {
            valid = true;
            params.data[params.colDef.field] = params.newValue;
        }
        return valid;
    }
}

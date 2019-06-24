import {Input} from "@angular/core";
import {GDAction} from "../interfaces/generic-dialog-action.model";


export abstract class BaseGenericContainerDialog {
    @Input() inputData: any;
    public showSpinner: boolean = false;
    public innerTitle: string = "";

    public  primaryDisable: (action?: GDAction) => boolean = (action) => {
        return false;
    }
    public  secondaryDisable: (action?: GDAction) => boolean = (action) => {
        return false;
    }

    public dirty: () => boolean = () => { return false; };

    protected constructor() {
    }
}

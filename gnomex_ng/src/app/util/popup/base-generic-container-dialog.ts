import { Input, Directive } from "@angular/core";
import {GDAction} from "../interfaces/generic-dialog-action.model";


@Directive()
export abstract class BaseGenericContainerDialog {
    @Input() inputData: any;
    public showSpinner: boolean = false;
    public innerTitle: string = "";

    public  primaryDisable: (action?: GDAction) => boolean = (action) => {
        return false;
    };

    public  secondaryDisable: (action?: GDAction) => boolean = (action) => {
        return false;
    };

    public dirty: () => boolean = () => { return false; };

    protected constructor() {
    }
}

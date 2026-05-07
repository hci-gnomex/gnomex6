import{Component} from '@angular/core';
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";

@Component({
    selector: 'sample-sheet-column-formats',
    templateUrl: 'sample-sheet-column-formats.component.html',
    styleUrls: ['./sample-sheet-column-formats.component.scss']
})
export class SampleSheetColumnFormatsComponent extends BaseGenericContainerDialog {
    constructor() {
        super();
    }
}

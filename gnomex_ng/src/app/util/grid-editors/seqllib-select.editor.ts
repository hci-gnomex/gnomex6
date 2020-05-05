import {Component} from "@angular/core";
import {SelectEditor} from "./select.editor";
import {DictionaryService} from "../../services/dictionary.service";
import {MatDialog} from "@angular/material/dialog";

@Component({
    templateUrl: "./select.editor.html",
    styles: [`
        .full-width  { width:  100%; }
        .full-height { height: 100%; }

        .flex-column-container {
            display: flex;
            flex-direction: row;
        }
        .flex-row  {
            display: flex;
        }
        .flex-stretch {
            display:flex;
            flex: 1;
        }
    `]
}) export class SeqLibSelectEditor extends SelectEditor {
    codeRequestCategory: string;

    constructor(public dictionaryService: DictionaryService, protected dialog: MatDialog) {
        super(dialog);
    }

    agInit(params: any): void {
        super.agInit(params);
        this.codeRequestCategory = params.node.data.codeRequestCategory;
        this.options = this.dictionaryService.getEntriesExcludeBlank("hci.gnomex.model.NumberSequencingCyclesAllowed").filter(proto =>
            proto.codeRequestCategory === this.codeRequestCategory && proto.isActive === 'Y'
        );

    }
}

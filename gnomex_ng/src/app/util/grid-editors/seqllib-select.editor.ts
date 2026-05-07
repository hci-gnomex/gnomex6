import {Component} from "@angular/core";
import {SelectEditor} from "./select.editor";
import {DictionaryService} from "../../services/dictionary.service";
import {MatDialog} from "@angular/material/dialog";

@Component({
    templateUrl: "./select.editor.html",
    styleUrls: ['./seqllib-select.editor.scss']
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

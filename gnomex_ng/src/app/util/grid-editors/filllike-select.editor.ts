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
}) export class FillLikeEditor extends SelectEditor {
    fillLike: boolean;
    fillLikeAttribute: string;
    gridValueField: string;


    constructor(protected dialog: MatDialog, public dictionaryService: DictionaryService) {
        super(dialog);
    }

    agInit(params: any): void {
        super.agInit(params);
        this.fillLikeAttribute = this.params.column.colDef.fillLikeAttribute;

    }

    onChange(event: any): void {
        super.onChange(event);
        if (event && event.currentTarget) {
            if (this.params && this.params.column && this.params.column.gridApi && this.params.node && this.fillLikeAttribute && this.fillLikeAttribute !== '') {
                let thisRowNode = this.params.node;

                this.params.column.gridApi.forEachNode((rowNode, index) => {
                    if (rowNode && rowNode.data && thisRowNode && thisRowNode.data
                        && rowNode.data[this.fillLikeAttribute] === thisRowNode.data[this.fillLikeAttribute]) {
                        rowNode.data[this.gridValueField] = event.currentTarget.value;
                        rowNode.setDataValue(this.gridValueField, event.currentTarget.value);
                    }
                });
            }
        }

    }
}

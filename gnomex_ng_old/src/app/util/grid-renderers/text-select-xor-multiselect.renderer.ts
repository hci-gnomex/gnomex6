import { Component } from "@angular/core";

import { SplitStringToMultipleLinesRenderer } from "./split-string-to-multiple-lines.renderer";

@Component ({
    selector: 'text-select-xor-multiselect-renderer',
    templateUrl: 'text-select-xor-multiselect.renderer.html',
    styles: [`
        .string-container {
            padding-left: 0.3rem;
        }

        .cursor { cursor: pointer; }

        .full-width  { width:  100% }
        .full-height { height: 100% }

        .t  { display: table; }
        .tr { display: table-row; }
        .td { display: table-cell; }

        .inline-block { display: inline-block; }

        .vertical-center { vertical-align: middle; }

        .error { color: red; }
    `]
})
export class TextSelectXorMultiselectRenderer extends SplitStringToMultipleLinesRenderer {

    public readonly TEXT:        string = 'TEXT';
    public readonly SELECT:      string = 'SELECT';
    public readonly MULTISELECT: string = 'MULTISELECT';

    private _displayType: string = this.TEXT;
    private isTextDisplay: boolean = true;

    get displayType(): string {
        return this._displayType;
    }
    set displayType(value: string) {
        if (value.toUpperCase() === this.TEXT
            || value.toUpperCase() === this.SELECT
            || value.toUpperCase() === this.MULTISELECT) {
            this._displayType = value.toUpperCase();

            if (value.toUpperCase() === this.TEXT) {
                this.isTextDisplay = true;
            } else {
                this.isTextDisplay = false;
            }

            this.prepareSelectOptions();
        }
    }

    agInit(params: any): void {
        this.params = params;

        if (this.params
            && this.params.node
            && this.params.node.data
            && this.params.column.colDef
            && this.params.column.colDef
            && this.params.column.colDef.field
            && this.params.column.colDef.field != ''
            && this.params.node.data[this.params.column.colDef.field]) {
            this.value = this.params.node.data[this.params.column.colDef.field];
        } else {
            this.value = '';
        }

        if (this.params && this.params.node && this.params.node.data) {
            if (this.params.node.data.isOptionChoice && this.params.node.data.isOptionChoice.toLowerCase() === 'y') {
                if (this.params.node.data.allowMultipleChoice && this.params.node.data.allowMultipleChoice.toLowerCase() === 'y') {
                    this.displayType = this.MULTISELECT;
                } else {
                    this.displayType = this.SELECT;
                }
            } else {
                this.displayType = this.TEXT;
            }
        }

        this.prepareSelectOptions();
    }

    private prepareSelectOptions(): void {
        if (!this.isTextDisplay) {
            this.rendererOptions = [];
            this.rendererOptionDisplayField = 'display';
            this.rendererOptionValueField = 'value';

            if (this.params
                && this.params.node
                && this.params.node.data
                && this.params.node.data.dictionary
                && this.params.node.data.dictionary.DictionaryEntry
                && Array.isArray(this.params.node.data.dictionary.DictionaryEntry)) {
                this.rendererOptions = this.params.node.data.dictionary.DictionaryEntry;
            }

            if (this.params && this.params.colDef) {
                if (this.params.colDef.rendererOptionDisplayField) {
                    this.rendererOptionDisplayField = '' + this.params.colDef.rendererOptionDisplayField;
                }
                if (this.params.colDef.rendererOptionValueField) {
                    this.rendererOptionValueField = '' + this.params.colDef.rendererOptionValueField;
                }
            }

            this.findDisplayValues();
            this.requestResizeRow();
        }
    }
}
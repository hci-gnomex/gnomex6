import { Component } from "@angular/core";
import {ICellEditorAngularComp} from "ag-grid-angular";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";
import {MultipleSelectDialogComponent} from "./popups/multiple-select-dialog.component";

@Component({
    selector: 'text-select-xor-multiselect-editor',
    templateUrl: 'text-select-xor-multiselect.editor.html',
    styles : [`
        .full-height { height: 100%; }
        .full-width  { width:  100%; }
    `]
})
export class TextSelectXorMultiselectEditor implements ICellEditorAngularComp {

    public readonly TEXT:        string = 'TEXT';
    public readonly SELECT:      string = 'SELECT';
    public readonly MULTISELECT: string = 'MULTISELECT';

    private _displayType: string = this.TEXT;

    public value: string = 'testing';
    public options: any[] = [];

    public params: any;

    constructor(private dialog: MatDialog) { }

    agInit(params: any): void {
        this.params = params;

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
    }

    getValue(): string {
        return this.value;
    }

    get displayType(): string {
        return this._displayType;
    }
    set displayType(value: string) {
        this._displayType = value;

        switch (this._displayType) {
            case this.TEXT :
                break;
            case this.SELECT :
                this.openSelectEditor();
                break;
            case this.MULTISELECT :
                this.openMultiselectEditor();
                break;
            default : // do nothing.
        }
    }

    private openSelectEditor(): void {

        this.options = [];

        if (this.params
            && this.params.node
            && this.params.node.data
            && this.params.node.data.dictionary
            && this.params.node.data.dictionary.DictionaryEntry
            && Array.isArray(this.params.node.data.dictionary.DictionaryEntry)) {
            this.options = this.params.node.data.dictionary.DictionaryEntry;
        }

        let optionName: string = '';

        if (this.params && this.params.node && this.params.node.data && this.params.node.data.displayName) {
            optionName = this.params.node.data.displayName;
        }

        let data: any = {
            value: '' + this.value,
            optionName: optionName,
            allowMultipleSelection: false,
            displayField: 'display',
            valueField: 'value',
            options: this.options
        };

        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.data = data;
        configuration.height = '30em';
        configuration.width = '40em';

        let dialogRef: MatDialogRef<MultipleSelectDialogComponent> = this.dialog.open(MultipleSelectDialogComponent, configuration);

        dialogRef.afterClosed().subscribe(() => {
            if (this.params && this.params.node && this.params.node.data) {
                this.params.node.data.value = dialogRef.componentInstance.getValue();
                this.params.node.setData(this.params.node.data);
            }
        })
    }

    private openMultiselectEditor(): void {

        this.options = [];

        if (this.params
            && this.params.node
            && this.params.node.data
            && this.params.node.data.dictionary
            && this.params.node.data.dictionary.DictionaryEntry
            && Array.isArray(this.params.node.data.dictionary.DictionaryEntry)) {
            this.options = this.params.node.data.dictionary.DictionaryEntry;
        }

        let optionName: string = '';

        if (this.params && this.params.node && this.params.node.data && this.params.node.data.displayName) {
            optionName = this.params.node.data.displayName;
        }

        let data: any = {
            value: '' + this.value,
            optionName: optionName,
            displayField: 'display',
            valueField: 'value',
            allowMultipleSelection: true,
            options: this.options
        };

        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.data = data;
        configuration.height = '30em';
        configuration.width = '40em';

        let dialogRef: MatDialogRef<MultipleSelectDialogComponent> = this.dialog.open(MultipleSelectDialogComponent, configuration);

        dialogRef.afterClosed().subscribe(() => {
            if (this.params && this.params.node && this.params.node.data) {
                this.params.node.data.value = dialogRef.componentInstance.getValue();
                this.params.node.setData(this.params.node.data);
            }
        })
    }
}
import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ICellEditorAngularComp} from "ag-grid-angular";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {SpinnerDialogComponent} from "../popup/spinner-dialog.component";

@Component({
    template: `
        <div class="full-width full-height flex-column-container">
            <div class="full-height flex-stretch flex-row {{ isInactiveOption(value) ? ' inactive' : '' }}">
                <select class="full-width full-height" [(value)]="value" [autofocus]="true" (change)="onChange($event)">
                    <option *ngFor="let option of options"
                            class="{{ isInactiveOption(value) ? ' inactive' : '' }}"
                            value="{{option.hasOwnProperty(optionsValueField) ? option[optionsValueField] : (option.value) ? option.value : option }}">
                        {{ "" + (option.hasOwnProperty(optionsDisplayField) ? option[optionsDisplayField] : (option.display) ? option.display : option) + (isInactiveOption(option) ? " (inactive)" : "") }}
                    </option>
                </select>
            </div>
            <div *ngIf="showFillButton" class="full-height flex-row button-container">
                <button class="full-height" (click)="onFillButtonClicked()">Fill</button>
            </div>
        </div>
    `,
    styles: [`
        .full-width {
            width: 100%;
        }

        .full-height {
            height: 100%;
        }

        .flex-column-container {
            display: flex;
            flex-direction: row;
        }

        .flex-row {
            display: flex;
        }

        .flex-stretch {
            display: flex;
            flex: 1;
        }
        
        
        .inactive {
            color: darkgrey;
            font-style: italic;
        }
    `]
})
export class ImprovedSelectEditor implements ICellEditorAngularComp, OnDestroy {

    public params: any;
    public value: any;

    fillLike: boolean;
    fillLikeAttribute: string;

    private _options: any[];
    public get options(): any[] {
        if (this.using_selectOptionsPerRowFilterFunction) {
            return this._filteredOptions;
        } else {
            return this._options;
        }
    }
    public set options(value: any[]) {
        this._options = value;
    }

    public optionsValueField: string;
    public optionsDisplayField: string;
    public optionsActiveField: string;

    public showInactiveOptions: boolean;

    // variables used for the optional per-row-filtering
    public context: any;
    protected using_selectOptionsPerRowFilterFunction: boolean = false;
    protected selectOptionsPerRowFilterFunction: (context:any, rowData: any, option: any) => boolean;
    private _filteredOptions: any[];


    public gridValueField: string;

    public showFillButton: boolean;		// This represents whether the editor should show the "Fill" button,
    // which is used to copy the value of this cell to other cells in this column in the grid
    public fillGroupAttribute: string;		// This attribute is used to specify which "Group" a particular
    // row belongs to, which is used when the fill button is active.
    // When clicked, the fill button will copy the data in that cell
    // to the corresponding cells in rows of the same group.
    public fillAll: boolean;                // If fillAll is set, all data will automatically be grouped together

    private _spinnerDialogIsOpen: boolean = false;
    private spinnerDialogRefs: MatDialogRef<SpinnerDialogComponent>[] = [];

    constructor(protected dialog: MatDialog) {
    }

    agInit(params: any): void {
        this.params = params;
        this.options = [];
        this.optionsValueField = "";
        this.optionsDisplayField = "";

        if (this.params && this.params.column && this.params.column.colDef) {
            this.gridValueField = this.params.column.colDef.field;

            if (this.params.column.colDef.selectOptionsValueField) {
                this.optionsValueField = this.params.column.colDef.selectOptionsValueField;
            } else {
                this.optionsValueField = "value"
            }
            if (this.params.column.colDef.selectOptionsDisplayField) {
                this.optionsDisplayField = this.params.column.colDef.selectOptionsDisplayField;
            } else {
                this.optionsDisplayField = "display";
            }
            if (this.params.column.colDef.selectOptionsActiveField) {
                this.optionsActiveField = this.params.column.colDef.selectOptionsActiveField;
            } else {
                this.optionsActiveField = "isActive";
            }
            if (this.params.column.colDef.showInactiveOptions) {
                this.showInactiveOptions = !!(this.params.column.colDef.showInactiveOptions);
            } else {
                this.showInactiveOptions = false;
            }

            if (this.showInactiveOptions) {
                if (Array.isArray(this.params.column.colDef.selectOptions)) {
                    this.options = this.params.column.colDef.selectOptions;
                } else {
                    this.options = [];
                }
            } else {
                if (Array.isArray(this.params.column.colDef.selectOptions)) {
                    this.options = this.params.column.colDef.selectOptions.filter((value: any) => {
                        return (!(value[this.optionsActiveField] && ("" + value[this.optionsActiveField]).toLowerCase() === "n"))
                            || (value[this.optionsValueField] === this.params.value);
                    });
                } else {
                    this.options = [];
                }
            }


            if (this.params.column.colDef.selectOptionsPerRowFilterFunction) {
                let backup = this.selectOptionsPerRowFilterFunction;
                try {
                    this.selectOptionsPerRowFilterFunction = this.params.column.colDef.selectOptionsPerRowFilterFunction;
                    this.using_selectOptionsPerRowFilterFunction = !!this.selectOptionsPerRowFilterFunction;
                } catch (e) {
                    console.error("selectOptionsPerRowFilterFunction option has wrong signature for column : " + this.params.column.colDef.headerName + "\n"
                        + "  Requires signature (context:any, rowData: any, option: any) => boolean"
                    );
                    this.selectOptionsPerRowFilterFunction = backup;
                    this.using_selectOptionsPerRowFilterFunction = !!backup;
                }
            }

            this.context = this.params.column.colDef.context;

            this.fillLikeAttribute = this.params.column.colDef.fillLikeAttribute;
            this.fillGroupAttribute = this.params.column.colDef.fillGroupAttribute;
            this.fillAll = this.params.column.colDef.fillAll && ("" + this.params.column.colDef.fillAll).toLowerCase() !== "false";

            this.showFillButton = this.params.column.colDef.showFillButton && ("" + this.params.column.colDef.showFillButton).toLowerCase() !== "false";

            if (this._options
                && this.params.node
                && this.params.node.data
                && this.using_selectOptionsPerRowFilterFunction) {

                this._filteredOptions = this._options.filter((option: any) => {
                    return this.selectOptionsPerRowFilterFunction(this.context, this.params.node.data, option);
                });
            }
        }

        if (this.params) {
            this.value = this.params.value ? "" + this.params.value : "";
        }

        if (this.showFillButton && !this.fillAll && (!this.fillGroupAttribute || this.fillGroupAttribute === '')) {
            throw new Error('Invalid state, cannot use fill button without specifying the fillGroupAttribute or fillAll.');
        }
    }

    ngOnDestroy(): void {
        if (this.params && this.params.node && this.params.node[(this.gridValueField + "_originalValue")]) {
            this.value = this.params.node[(this.gridValueField + "_originalValue")];
        }
    }

    public isInactiveOption(option: any): boolean {
        return option.hasOwnProperty(this.optionsActiveField) && ("" + option[this.optionsActiveField]).toLowerCase() === "n";
    }

    onChange(event: any): void {
        if (event && event.currentTarget) {

            if (this.params && this.params.node && !this.params.node[(this.gridValueField + "_originalValue")]) {
                this.params.node[(this.gridValueField + "_originalValue")] = this.value;
            }

            // This looks unnecessary, since this.value is linked to the value of the select component, but
            // because this also ends editing, it also queues the destruction of this component and the call to getValue.
            // The problem was that this.value isn't updated with the new value before this event fires,
            // so we need to update it manually here.
            this.value = event.currentTarget.value;
            this.params.node.setDataValue(this.gridValueField, this.value);
        }
        if (this.params) {

            //  If the fill button, which is part of the editor, is activated, don't stop editing
            // immediately after making a selection.
            if (!this.showFillButton) {
                this.params.stopEditing();
            }
        }

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

    getValue(): any {
        return this.value ? this.value : '';
    }

    isPopup(): boolean {
        return false;
    }

    onFillButtonClicked(): void {
        if (!this.fillAll && (!this.fillGroupAttribute || this.fillGroupAttribute === '')) {
            throw new Error('No column attribute "fillGroupAttribute" or "fillAll" specified. This is required to use the Fill functionality.');
        }

        if (this.params && this.params.column && this.params.column.gridApi && this.params.node && (this.fillAll || (this.fillGroupAttribute && this.fillGroupAttribute !== ''))) {
            let thisRowNode = this.params.node;

            this.startSpinnerDialog();
            this.params.column.gridApi.forEachNodeAfterFilter((rowNode) => {
                if (rowNode && rowNode.data && thisRowNode && thisRowNode.data && (this.fillAll || rowNode.data[this.fillGroupAttribute] === thisRowNode.data[this.fillGroupAttribute])) {
                    let spoofedEvent: any = {
                        api: this.params.column.gridApi,
                        colDef: this.params.column.colDef,
                        column: this.params.column,
                        columnApi: this.params.column.columnApi,
                        context: undefined,
                        data: rowNode.data,
                        event: null,
                        newValue: this.value,
                        node: rowNode,
                        oldValue: rowNode.data[this.gridValueField],
                        rowIndex: rowNode.rowIndex,
                        rowPinned: undefined,
                        type: 'cellValueChanged',
                        value: this.value
                    };

                    rowNode.data[this.gridValueField] = this.value;
                    rowNode.setDataValue(this.gridValueField, this.value);
                    this.params.column.gridApi.dispatchEvent(spoofedEvent);
                }
            });

            this.params.column.gridApi.refreshCells();
            setTimeout(() => {
                this.stopSpinnerDialogs();
            });
        }
    }

    startSpinnerDialog(): MatDialogRef<SpinnerDialogComponent> {
        if (this._spinnerDialogIsOpen) {
            return null;
        }

        this._spinnerDialogIsOpen = true;

        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.data = {
            message: "Please wait...",
            strokeWidth: 3,
            diameter: 30
        };
        configuration.width = "13em";
        configuration.disableClose = true;

        let dialogRef: MatDialogRef<SpinnerDialogComponent> = this.dialog.open(SpinnerDialogComponent, configuration);
        dialogRef.afterClosed().subscribe(() => { this._spinnerDialogIsOpen = false; });
        this.spinnerDialogRefs.push(dialogRef);

        return dialogRef;
    }

    stopSpinnerDialogs(): void {
        for (let dialogRef of this.spinnerDialogRefs) {
            setTimeout(() => {
                dialogRef.close();
            });
        }
        this.spinnerDialogRefs = [];
    }
}

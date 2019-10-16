import {Component, OnDestroy} from "@angular/core";
import {ICellEditorAngularComp} from "ag-grid-angular";

@Component({
    templateUrl: "./select.editor.html",
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
    `]
})
export class SelectEditor implements ICellEditorAngularComp, OnDestroy {
    public params: any;
    public value: any;
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


    agInit(params: any): void {
        this.params = params;
        this.options = [];
        this.optionsValueField = "";
        this.optionsDisplayField = "";

        if (this.params && this.params.column && this.params.column.colDef) {
            this.gridValueField = this.params.column.colDef.field;

            this.options = this.params.column.colDef.selectOptions;
            this.optionsValueField = this.params.column.colDef.selectOptionsValueField;
            this.optionsDisplayField = this.params.column.colDef.selectOptionsDisplayField;

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

            this.params.column.gridApi.forEachNode((rowNode) => {
                if (rowNode && rowNode.data && thisRowNode && thisRowNode.data && (this.fillAll || rowNode.data[this.fillGroupAttribute] === thisRowNode.data[this.fillGroupAttribute])) {
                    rowNode.data[this.gridValueField] = this.value;
                    rowNode.setDataValue(this.gridValueField, this.value);
                }
            });

            this.params.column.gridApi.refreshCells();
        }
    }
}
